"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface FileUploaderProps {
  label: string;
  accept: string;
  maxSizeMB?: number;
  currentFileUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  fileType: "image" | "document";
}

export function FileUploader({
  label,
  accept,
  maxSizeMB = 5,
  currentFileUrl,
  onFileSelect,
  fileType,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFileUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size / 1024 / 1024 > maxSizeMB) {
      toast.error(`File size too big (max ${maxSizeMB}MB)`);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);

    if (fileType === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>

      {!selectedFile && !previewUrl ? (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
            dragActive ? "border-primary bg-accent" : "border-muted-foreground/25"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center p-4 border rounded-lg bg-card">
          {fileType === "image" && previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
          ) : (
            <div className="p-2 bg-primary/10 rounded-full mr-4">
              {fileType === "image" ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <FileText className="w-6 h-6 text-primary" />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedFile ? selectedFile.name : "Current File"}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Uploaded"}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
