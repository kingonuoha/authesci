'use client';

import React from 'react';
import Image from 'next/image';
import { File, Download, Trash2 } from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';

interface FileCardProps {
  name: string;
  type: string;
  size: string;
  imageUrl?: string;
  uploadedBy?: string;
  uploadedAt?: Date;
  onDownload?: () => void;
  downloadUrl?: string;
  onDelete?: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ name, type, size, imageUrl, uploadedBy, uploadedAt, onDownload, downloadUrl, onDelete }) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="card bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={48} height={48} className="rounded-lg object-cover w-12 h-12 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-lg flex-shrink-0">
            <File className="w-6 h-6 text-neutral-500" aria-hidden="true" />
          </div>
        )}
        <div className="flex-grow min-w-0">
          <h6 className="font-semibold text-neutral-900 dark:text-white truncate mb-1" title={name}>{name}</h6>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs flex items-center gap-1">
            {size} &bull; {type}
          </p>
          {(uploadedBy || uploadedAt) && (
            <div className="text-xs text-neutral-400 mt-2">
              {uploadedBy && <span>by {uploadedBy}</span>}
              {uploadedBy && uploadedAt && <span> &bull; </span>}
              {uploadedAt && <span>{formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-end gap-2">
        <button type="button" className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors" onClick={handleDownload} aria-label="Download file" title="Download">
          <Download className="w-4 h-4" aria-hidden="true" />
        </button>
        {onDelete && (
          <button type="button" className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" onClick={onDelete} aria-label="Delete file" title="Delete">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FileCard;
