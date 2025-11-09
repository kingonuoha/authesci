import React from 'react';
import Image from 'next/image';

interface EmptyStateProps {
  image: string;
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ image, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <Image src={image} alt="Empty state" width={200} height={200} />
      <h6 className="mb-1 mt-4 text-xl font-semibold">{title}</h6>
      <p className="mb-0 text-sm text-neutral-500">{description}</p>
    </div>
  );
};

export default EmptyState;
