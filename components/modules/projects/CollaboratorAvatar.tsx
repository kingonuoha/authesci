import React from 'react';
import Image from 'next/image';

interface CollaboratorAvatarProps {
  name: string;
  imageUrl: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const statusClasses = {
    online: 'bg-success-600',
    offline: 'bg-neutral-400',
}

const CollaboratorAvatar: React.FC<CollaboratorAvatarProps> = ({ name, imageUrl, size = 'md', status }) => {
  return (
    <div className={`relative inline-block ${sizeClasses[size]}`}>
      <Image src={imageUrl} alt={name} width={80} height={80} className="rounded-full object-cover w-full h-full" />
      {status && (
        <span className={`w-3 h-3 ${statusClasses[status]} border-2 border-white dark:border-neutral-800 rounded-full absolute end-0 bottom-0`}>
          <span className="sr-only">{status}</span>
        </span>
      )}
    </div>
  );
};

export default CollaboratorAvatar;
