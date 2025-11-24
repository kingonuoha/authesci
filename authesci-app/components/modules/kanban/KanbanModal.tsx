'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, TaskPriority } from '@prisma/client';

interface KanbanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string; tag: string; dueDate: string; image?: File; assignedTo?: string; priority?: TaskPriority }) => Promise<void>;
  initialData?: Task;
  collaborators?: any[];
}

export function KanbanModal({ isOpen, onClose, onSave, initialData, collaborators = [] }: KanbanModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        // setTag(initialData.tag || ''); 
        setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
        setAssignedTo(initialData.assignedTo || '');
        setPriority(initialData.priority || TaskPriority.MEDIUM);
      } else {
        setTitle('');
        setDescription('');
        setTag('');
        setDueDate(new Date().toISOString().split('T')[0]); // Default to today
        setAssignedTo('');
        setPriority(TaskPriority.MEDIUM);
        setImage(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
        alert("Title is required");
        return;
    }
    if (!description.trim()) {
        alert("Description is required");
        return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ 
        title, 
        description, 
        tag, 
        dueDate, 
        image: image || undefined,
        assignedTo: assignedTo || undefined,
        priority
      });
      onClose();
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-neutral-800">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-neutral-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {initialData ? 'Edit Task' : 'Add New Task'}
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
          <div className="p-4 md:p-5 space-y-4">
            <form id="taskForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="taskTitle" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Title</label>
                <input
                  type="text"
                  className="form-control w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter Event Title"
                  id="taskTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label htmlFor="taskPriority" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Priority</label>
                    <select
                      id="taskPriority"
                      className="form-control w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    >
                      {Object.values(TaskPriority).map((p) => (
                        <option key={p as string} value={p as string}>{p as string}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="taskAssignee" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Assign To</label>
                    <select
                      id="taskAssignee"
                      className="form-control w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {collaborators.map((collab) => (
                        <option key={collab.user.id} value={collab.user.id}>
                          {collab.user.fullName || collab.user.email}
                        </option>
                      ))}
                    </select>
                  </div>
              </div>

              <div className="mb-3">
                <label htmlFor="startDate" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Due Date</label>
                <input
                  type="date"
                  className="form-control w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  id="startDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="taskDescription" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Description</label>
                <textarea
                  className="form-control w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  id="taskDescription"
                  rows={3}
                  placeholder="Write some text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="taskImage" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">Attachments <span className="text-sm">(Jpg, Png format)</span> </label>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="taskImage"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img id="taskImagePreview" src={imagePreview} alt="Image Preview" className="mt-2 max-h-40 rounded-lg" />
                )}
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="border border-red-600 bg-red-50 hover:bg-red-100 text-red-600 text-base px-[50px] py-[11px] rounded-lg dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 text-base px-7 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
