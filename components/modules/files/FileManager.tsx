'use client';

import React, { useState } from 'react';
import { ProjectFile, Profile } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Upload, FileText, HardDrive } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { saveFileRecord } from '@/app/(app)/actions/files';
import { Progress } from '@/components/ui/progress';
import FileCard from '@/components/modules/projects/FileCard';


// Define the type with relation
type ProjectFileWithUploader = ProjectFile & { uploader?: Profile };

interface FileManagerProps {
  projectId: string;
  initialFiles: ProjectFileWithUploader[];
  readOnly?: boolean;
}

export default function FileManager({ projectId, initialFiles, readOnly }: FileManagerProps) {
  const [files, setFiles] = useState<ProjectFileWithUploader[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Get signature
      const res = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) throw new Error('Failed to get upload signature');
      const { signature, timestamp, cloudName, apiKey, folder } = await res.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });

      const result = await uploadPromise;

      // 3. Save record
      const saveResult = await saveFileRecord(projectId, file.name, result.secure_url, file.type, file.size);

      if (saveResult.success && saveResult.file) {
        // Optimistically add (uploader will be missing initially until refresh, or we can mock current user if needed)
        // For now, add without uploader or fetch it.
        // Let's assume the user reloads to see "Uploaded by Me" or we handle it in actions to return relation.
        // Action currently returns basic file.
        setFiles(prev => [saveResult.file as ProjectFileWithUploader, ...prev]);
        toast.success('File uploaded successfully');
      } else {
        throw new Error('Failed to save file record');
      }

    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = ''; // Reset input
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((acc, file) => acc + (file.fileSize || 0), 0);

  return (
    <div className="space-y-8">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Total Files</p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{files.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Total Size</p>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{formatSize(totalSize)}</h3>
          </div>
        </div>
        {!readOnly && (
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <Button disabled={isUploading} variant="secondary" className="pointer-events-none">
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload New File'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <Progress value={uploadProgress} className="w-full" />
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700">
            <div className="mx-auto w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No files uploaded yet</h3>
            {!readOnly && <p className="text-neutral-500 mt-1">Upload documents to share with the project team.</p>}
          </div>
        ) : (
          files.map((file) => (
            <FileCard
              key={file.id}
              name={file.fileName}
              type={file.fileType}
              size={formatSize(file.fileSize || 0)}
              imageUrl={file.fileType.startsWith('image/') ? file.fileUrl : undefined}
              uploadedBy={file.uploader?.fullName}
              uploadedAt={file.createdAt}
              onDownload={() => window.open(file.fileUrl, '_blank')}
              onDelete={!readOnly ? async () => {
                // Implement delete logic if needed (requires passing delete action or implementing it here)
                toast.error("Delete not implemented in this view yet");
              } : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
