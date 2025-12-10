'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@prisma/client';
import { KanbanCard } from './KanbanCard';
import { PlusCircle, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: (Task & { assignee?: { fullName: string | null; avatarUrl: string | null; email: string } | null })[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  onDuplicateColumn?: (columnId: TaskStatus) => void;
  readOnly?: boolean;
}

export function KanbanColumn({ id, title, tasks, onAddTask, onEditTask, onDeleteTask, onTaskClick, onDuplicateColumn, readOnly }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  // Map status to specific card classes if needed, though template uses generic classes mostly
  // except for the wrapper div width which is set in parent

  return (
    <div className="kanban-item rounded-xl w-[85vw] sm:w-[300px] md:w-[350px] flex-shrink-0 snap-center">
      <div className="card p-0 rounded-xl overflow-hidden shadow-none border-0 bg-white dark:bg-neutral-900">
        <div className="card-body p-0 pb-6">
          <div className="flex items-center gap-2 justify-between ps-6 pt-6 pe-6 mb-6">
            <h6 className="text-lg font-semibold mb-0 text-neutral-900 dark:text-neutral-100">{title}</h6>
            {!readOnly && (
              <div className="flex items-center gap-3 justify-between mb-0">
                <button
                  type="button"
                  className="text-2xl text-neutral-500 hover:text-primary-600 add-task-button flex transition-colors"
                  onClick={onAddTask}
                >
                  <PlusCircle className="w-6 h-6" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-neutral-800 flex text-lg dark:text-white hover:text-primary-600 transition-colors" type="button">
                      <MoreHorizontal className="w-6 h-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onDuplicateColumn?.(id)}>
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div ref={setNodeRef} className="connectedSortable ps-6 pe-6 min-h-[150px]">
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onClick={onTaskClick}
                  readOnly={readOnly}
                />
              ))}
            </SortableContext>
          </div>

          {!readOnly && (
            <button
              type="button"
              className="flex items-center gap-2 font-medium w-full text-primary-600 justify-center hover:text-primary-800 add-task-button mt-4 transition-colors"
              onClick={onAddTask}
            >
              <PlusCircle className="w-5 h-5" />
              Add Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
