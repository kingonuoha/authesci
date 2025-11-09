import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  description: string;
  imageUrl: string;
}

const JobCard: React.FC<JobCardProps> = ({ title, company, location, description, imageUrl }) => {
  return (
    <div className="card h-full rounded-xl overflow-hidden border-0 shadow-lg">
      <Image src={imageUrl} className="card-img-top" alt={title} width={400} height={200} />
      <div className="card-body p-4">
        <h5 className="card-title text-lg text-neutral-600 dark:text-neutral-200 mb-1.5">{title}</h5>
        <p className="text-sm text-neutral-500 mb-1">{company} - {location}</p>
        <p className="card-text text-neutral-600 mb-4 line-clamp-3">{description}</p>
        <Link href="/jobs/details" className="btn text-primary-600 dark:text-primary-500 hover:underline px-0 py-2.5 inline-flex items-center gap-2">
          Read More <ArrowRight className="text-xl" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
