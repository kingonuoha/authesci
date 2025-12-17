'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task, TaskStatus, TaskPriority } from '@prisma/client';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { KanbanModal } from './KanbanModal';
import { KanbanDetailsModal } from './KanbanDetailsModal';
import { RealtimeCursors } from './RealtimeCursors';
import { createTask, updateTaskStatus, updateTask, deleteTask } from '@/app/(app)/actions/kanban';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface KanbanBoardProps {
  projectId: string;
  initialTasks: (Task & { assignee?: { fullName: string | null; avatarUrl: string | null; email: string } | null })[];
  collaborators: any[];
  readOnly?: boolean;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'OPEN', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export default function KanbanBoard({ projectId, initialTasks, collaborators, readOnly }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<(Task & { assignee?: { fullName: string | null; avatarUrl: string | null; email: string } | null })[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const supabase = createClient();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const mapTaskFromRealtime = (payload: any): Task => {
      return {
        id: payload.id,
        projectId: payload.project_id,
        assignedTo: payload.assigned_to,
        title: payload.title,
        description: payload.description,
        status: payload.status,
        priority: payload.priority,
        dueDate: payload.due_date ? new Date(payload.due_date) : null,
        imageUrl: payload.image_url,
        createdAt: new Date(payload.created_at),
        updatedAt: new Date(payload.updated_at),
      } as Task;
    };

    const resolveAssignee = (assignedToId: string | null) => {
      if (!assignedToId) return null;
      const collaborator = collaborators.find(c => c.user.id === assignedToId);
      return collaborator ? collaborator.user : null;
    };

    const channel = supabase
      .channel('kanban-board-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTask = mapTaskFromRealtime(payload.new);
            const assignee = resolveAssignee(newTask.assignedTo);
            setTasks((prev) => [...prev, { ...newTask, assignee }]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = mapTaskFromRealtime(payload.new);
            const assignee = resolveAssignee(updatedTask.assignedTo);
            setTasks((prev) =>
              prev.map((task) => (task.id === updatedTask.id ? { ...updatedTask, assignee } : task))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase, collaborators]);

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; color: string } | null>(null);

  const getRandomColor = (id: string) => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  useEffect(() => {
    const channel = supabase.channel(`kanban-presence-${projectId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat();
        // Filter out duplicates by user_id if needed, but presenceState handles it per client
        // We might want to deduplicate by user_id if a user has multiple tabs open
        const uniqueUsers = Array.from(new Map(users.map((u: any) => [u.user_id, u])).values());
        setOnlineUsers(uniqueUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Match by email since we don't have userId in collaborators selection yet
            const myProfile = collaborators.find(c => c.user.email === user.email)?.user;

            setCurrentUser({
              id: user.id,
              name: myProfile?.fullName || user.email?.split('@')[0] || 'Anonymous',
              color: getRandomColor(user.id)
            });

            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
              fullName: myProfile?.fullName || user.email, // Fallback
              avatarUrl: myProfile?.avatarUrl,
              email: user.email
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, supabase, collaborators]);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      // 1. Get presigned URL
      const response = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) throw new Error('Failed to get upload signature');

      const { signature, timestamp, cloudName, apiKey, folder } = await response.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');

      const data = await uploadRes.json();
      return data.secure_url;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleSaveTask = async (data: { title: string; description: string; tag: string; dueDate: string; assignedTo?: string; image?: File; priority?: TaskPriority }) => {
    let imageUrl = (editingTask as any)?.imageUrl;

    if (data.image) {
      const uploadedUrl = await uploadImage(data.image);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        // If upload fails, stop saving? Or continue without image?
        // For now, let's stop to avoid saving incomplete data if image was important
        return;
      }
    }

    if (editingTask) {
      // Update existing task
      const result = await updateTask(editingTask.id, projectId, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignedTo: data.assignedTo,
        priority: data.priority,
        imageUrl: imageUrl || undefined
      });
      if (result.success) {
        toast.success("Task updated");
      } else {
        toast.error("Failed to update task");
      }
    } else {
      // Create new task
      const result = await createTask(projectId, data.title, data.description, data.dueDate ? new Date(data.dueDate) : undefined, data.assignedTo, data.priority, imageUrl || undefined);
      if (result.success) {
        toast.success("Task created");
      } else {
        toast.error("Failed to create task");
      }
    }
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const [originalStatus, setOriginalStatus] = useState<TaskStatus | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setOriginalStatus(task.status);
    }
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (!activeTask) return;

    const activeContainer = activeTask.status;
    // If over a column, the id is the column id (TaskStatus)
    // If over a task, the id is the task id, so we need to find its status
    const overContainer = COLUMNS.some(c => c.id === overId)
      ? overId as TaskStatus
      : overTask?.status;

    if (!overContainer || activeContainer === overContainer) {
      return;
    }

    // Optimistic update for drag over
    setTasks((prev) => {
      const activeItems = prev.filter((t) => t.status === activeContainer);
      const overItems = prev.filter((t) => t.status === overContainer);

      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      const overIndex = overItems.findIndex((t) => t.id === overId);

      let newIndex;
      if (COLUMNS.some(c => c.id === overId)) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((t) => {
        if (t.id === activeId) {
          return { ...t, status: overContainer };
        }
        return t;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over ? (over.id as string) : null;

    if (!overId) {
      setActiveId(null);
      setOriginalStatus(null);
      return;
    }

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) {
      setActiveId(null);
      setOriginalStatus(null);
      return;
    }

    const overContainer = COLUMNS.some(c => c.id === overId)
      ? overId as TaskStatus
      : tasks.find((t) => t.id === overId)?.status;

    if (overContainer && originalStatus !== overContainer) {
      // Update status in DB
      await updateTaskStatus(activeId, projectId, overContainer);
      toast.success(`Task moved to ${COLUMNS.find(c => c.id === overContainer)?.title}`);
    }

    setActiveId(null);
    setOriginalStatus(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteTask(taskId, projectId);
        if (res.success) {
          toast.success("Task deleted");
        } else {
          toast.error("Failed to delete task");
        }
      }
    });
  };

  const openNewTaskModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setViewingTask(task);
    setIsDetailsModalOpen(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Add distance constraint to prevent accidental drags during clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex items-center gap-2 px-6 mb-4 flex-shrink-0">
        <span className="text-sm text-neutral-500 font-medium">Online:</span>
        <div className="flex -space-x-2">
          {onlineUsers.map((u: any) => (
            <div key={u.user_id} className="relative group" title={u.fullName || u.email}>
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt={u.fullName} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                  {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto scroll-sm pb-8 h-full w-full">
        <div className="kanban-wrapper w-full relative">
          {currentUser && (
            <RealtimeCursors
              projectId={projectId}
              userId={currentUser.id}
              userName={currentUser.name}
              userColor={currentUser.color}
            />
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-4 md:gap-6 pb-4 snap-x snap-mandatory px-4 md:px-0" id="sortable-wrapper">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={tasks.filter((t) => t.status === col.id)}
                  onAddTask={openNewTaskModal}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onTaskClick={handleTaskClick}
                  onDuplicateColumn={(colId) => {
                    toast('Column duplication coming soon!', {
                      icon: '🚧',
                    });
                  }}
                  readOnly={readOnly}
                />
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <KanbanCard task={tasks.find((t) => t.id === activeId)!} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      <KanbanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
        collaborators={collaborators}
      />

      <KanbanDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={viewingTask}
      />
    </div>
  );
}


