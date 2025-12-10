import React from 'react';
import Image from 'next/image';
import { File, Download, Trash2 } from 'lucide-react';

interface FileCardProps {
  name: string;
  type: string;
  size: string;
  imageUrl?: string;
  onDownload: () => void;
  onDelete: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ name, type, size, imageUrl, onDownload, onDelete }) => {
  return (
    <div className="kanban-card bg-neutral-50 dark:bg-dark-3 p-4 rounded-lg mb-6 shadow-md">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={64} height={64} className="rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 rounded-lg">
            <File className="w-8 h-8 text-neutral-500" aria-hidden="true" />
          </div>
        )}
        <div className="flex-grow">
          <h6 className="kanban-title text-lg font-semibold mb-1 truncate">{name}</h6>
          <p className="text-secondary-light text-sm">{type} - {size}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2.5">
        <button type="button" className="card-download-button text-primary-600" onClick={onDownload} aria-label="Download file">
          <Download className="icon text-lg line-height-1" aria-hidden="true" />
        </button>
        <button type="button" className="card-delete-button text-danger-600" onClick={onDelete} aria-label="Delete file">
          <Trash2 className="icon text-lg line-height-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
