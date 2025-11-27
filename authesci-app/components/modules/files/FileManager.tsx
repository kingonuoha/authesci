'use client';

import React, { useState } from 'react';
import { ProjectFile } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { saveFileRecord } from '@/app/actions/files';
import { Progress } from '@/components/ui/progress';

interface FileManagerProps {
  projectId: string;
  initialFiles: ProjectFile[];
  readOnly?: boolean;
}

export default function FileManager({ projectId, initialFiles, readOnly }: FileManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
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
        setFiles(prev => [saveResult.file!, ...prev]);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        {!readOnly && (
          <div className="relative">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Button disabled={isUploading}>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        )}
      </div>

      {isUploading && (
        <Progress value={uploadProgress} className="w-full" />
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No files uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {file.fileName}
                  </TableCell>
                  <TableCell>{file.fileSize ? formatFileSize(file.fileSize) : '-'}</TableCell>
                  <TableCell>{file.fileType}</TableCell>
                  <TableCell>{format(new Date(file.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
