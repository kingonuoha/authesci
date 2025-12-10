import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckSquare, Users } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  taskCount: number;
  collaboratorCount: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, description, imageUrl, taskCount, collaboratorCount }) => {
  return (
    <div className="card h-full rounded-xl overflow-hidden border-0 shadow-lg">
      <Image src={imageUrl} className="card-img-top" alt={title} width={400} height={200} />
      <div className="card-body p-4">
        <h5 className="card-title text-lg text-neutral-600 dark:text-neutral-200 mb-1.5">{title}</h5>
        <p className="card-text text-neutral-600 mb-4 line-clamp-3">{description}</p>
        <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
            <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" aria-hidden="true" />
                <span>{taskCount} Tasks</span>
            </div>
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>{collaboratorCount} Collaborators</span>
            </div>
        </div>
        <Link href="/projects/details" className="btn text-primary-600 dark:text-primary-500 hover:underline px-0 py-2.5 inline-flex items-center gap-2">
          View Project <ArrowRight className="text-xl" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
