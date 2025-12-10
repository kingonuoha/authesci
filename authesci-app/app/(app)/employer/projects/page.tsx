import React from "react";
import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role, ProjectStatus, CollaboratorStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProjectList } from "@/components/modules/projects/ProjectList";

export default async function EmployerProjectsPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.EMPLOYER, Role.ADMIN],
  });

  const projects = await prisma.project.findMany({
    where: {
      collaborators: {
        some: {
          userId: profile.id,
          status: CollaboratorStatus.ACTIVE,
        },
      },
    },
    include: {
      _count: {
        select: { collaborators: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Projects</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage your active research projects</p>
        </div>
      </div>
      <ProjectList projects={projects} role="employer" />
    </div>
  );
}
