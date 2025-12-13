"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface StorageInfoProps {
  storageUsed: number;
  storageCapacity: number;
}

// Helper to format bytes into a readable string
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function StorageInfo({ storageUsed, storageCapacity }: StorageInfoProps) {
  const percentage = storageCapacity > 0 ? (storageUsed / storageCapacity) * 100 : 0;
  
  const handleUpgradeClick = () => {
    MySwal.fire({
      title: 'Upgrade to Pro',
      text: 'Pro plans with more storage are coming soon!',
      icon: 'info',
      confirmButtonText: 'Got it!',
      customClass: {
        popup: 'dark:bg-neutral-800 dark:text-white',
        title: 'dark:text-white',
        htmlContainer: 'dark:text-neutral-300'
      }
    });
  };

  return (
    <div className="p-6 mb-6 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Storage Usage</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You have used {formatBytes(storageUsed)} of {formatBytes(storageCapacity)}.
          </p>
        </div>
        <Button variant="outline" onClick={handleUpgradeClick}>
          Upgrade Plan
        </Button>
      </div>
      <div className="mt-4">
        <Progress value={percentage} className="w-full h-2" />
      </div>
    </div>
  );
}
