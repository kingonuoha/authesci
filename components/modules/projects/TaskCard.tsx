import React from 'react';
import Image from 'next/image';
import { Tag, Calendar, Edit, Trash2 } from 'lucide-react';

interface TaskCardProps {
  title: string;
  description: string;
  tag: string;
  date: string;
  imageUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, description, tag, date, imageUrl, onEdit, onDelete }) => {
  return (
    <div className="kanban-card bg-neutral-50 dark:bg-dark-3 p-4 rounded-lg mb-6 shadow-md">
      {imageUrl && (
        <div className="rounded-lg mb-3 max-h-[350px] overflow-hidden">
          <Image src={imageUrl} alt={title} width={400} height={200} className="w-full h-full object-cover" />
        </div>
      )}
      <h6 className="kanban-title text-lg font-semibold mb-2">{title}</h6>
      <p className="kanban-desc text-secondary-light text-sm">{description}</p>
      <button type="button" className="btn text-primary-600 border rounded border-primary-600 bg-hover-primary-600 text-hover-white flex items-center gap-2 my-3 text-sm px-3 py-1">
        <Tag className="icon w-4 h-4" aria-hidden="true" />
        <span className="kanban-tag font-semibold">{tag}</span>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <Calendar className="text-neutral-600 dark:text-neutral-200 w-4 h-4" aria-hidden="true" />
          <span className="start-date text-secondary-light text-sm">{date}</span>
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <button type="button" className="card-edit-button text-success-600" onClick={onEdit} aria-label="Edit task">
            <Edit className="icon text-lg line-height-1" aria-hidden="true" />
          </button>
          <button type="button" className="card-delete-button text-danger-600" onClick={onDelete} aria-label="Delete task">
            <Trash2 className="icon text-lg line-height-1" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
