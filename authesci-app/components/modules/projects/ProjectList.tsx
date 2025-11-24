"use client";

import React from "react";
import Link from "next/link";
import { Project, ProjectStatus } from "@prisma/client";
import { FlaskConical, Calendar, Users } from "lucide-react";

interface ProjectListProps {
  projects: (Project & {
    _count: {
      collaborators: number;
    };
  })[];
  role: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, role }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-neutral-100 dark:bg-neutral-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FlaskConical className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No Active Projects</h3>
        <p className="text-neutral-500 dark:text-neutral-400">You don't have any active projects yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link 
          key={project.id} 
          href={`/project/${project.id}`}
          className="block group"
        >
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group-hover:border-primary-500/50">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg">
                <FlaskConical className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
              }`}>
                {project.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {project.title}
            </h3>
            
            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-6 h-10">
              {project.description || "No description provided."}
            </p>
            
            <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-700 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{project._count.collaborators} Members</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
