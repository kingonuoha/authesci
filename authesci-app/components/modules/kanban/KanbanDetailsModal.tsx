'use client';

import React from 'react';
import { X, Calendar, Tag } from 'lucide-react';
import { Task } from '@prisma/client';
import { format } from 'date-fns';

interface KanbanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function KanbanDetailsModal({ isOpen, onClose, task }: KanbanDetailsModalProps) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-neutral-800">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-neutral-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task Details
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <X className="w-3 h-3" />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="p-6 space-y-6">
             <div>
                 <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h4>
                 <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {task.dueDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {format(new Date(task.dueDate), 'PPP')}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>UI Design</span> {/* Placeholder tag */}
                    </div>
                 </div>
             </div>

             <div>
                 <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h5>
                 <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                     {task.description || "No description provided."}
                 </p>
             </div>

             {/* Placeholder for attachments if we had them */}
             {/* <div>
                 <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Attachments</h5>
                 <div className="grid grid-cols-2 gap-4">
                     <img src="..." alt="Attachment" className="rounded-lg" />
                 </div>
             </div> */}
          </div>
          <div className="flex items-center justify-end gap-4 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 text-base px-7 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
