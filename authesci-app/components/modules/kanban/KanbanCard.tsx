'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '@prisma/client';
import { Calendar, Tag, Edit, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanCardProps {
  task: Task & { 
    assignee?: { fullName: string | null; avatarUrl: string | null; email: string } | null;
  };
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onClick?: (task: Task) => void;
}

export function KanbanCard({ task, onEdit, onDelete, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50 border-red-600 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-600 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-400';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-600 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-50 border-gray-600';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="kanban-card bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg mb-6 cursor-grab active:cursor-grabbing shadow-sm border border-neutral-200 dark:border-neutral-700"
      onClick={() => onClick?.(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h6 className="kanban-title text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {task.title}
        </h6>
        {task.priority && (
            <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                {task.priority}
            </span>
        )}
      </div>
      
      {task.imageUrl && (
        <div className="mb-3 rounded-lg overflow-hidden h-32 w-full">
            <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
        </div>
      )}

      {task.description && (
        <p className="kanban-desc text-neutral-500 dark:text-neutral-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
             {task.assignee ? (
                <div className="flex items-center gap-2" title={task.assignee.fullName || task.assignee.email}>
                    {task.assignee.avatarUrl ? (
                        <img src={task.assignee.avatarUrl} alt="Assignee" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                            {(task.assignee.fullName || task.assignee.email).charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
             ) : (
                 <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center" title="Unassigned">
                     <User className="w-3 h-3" />
                 </div>
             )}
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-xs">
                <Calendar className="w-3 h-3" />
                <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d') : '-'}</span>
            </div>
            
            <div className="flex items-center gap-1">
                <button 
                    type="button" 
                    className="p-1 text-neutral-400 hover:text-green-600 transition-colors"
                    onClick={(e) => {
                    e.stopPropagation(); 
                    onEdit?.(task);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                    type="button" 
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                    onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(task.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
