"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/service";

// Define TaskPriority locally to avoid import errors if Prisma client is outdated
// type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

async function checkAccess(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new Error("Profile not found");

  const collaborator = await prisma.collaborator.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: profile.id,
      },
    },
  });

  if (!collaborator) throw new Error("Unauthorized");
  return { user, profile };
}

export async function createTask(
  projectId: string, 
  title: string, 
  description: string, 
  dueDate?: Date, 
  assignedTo?: string,
  priority?: TaskPriority,
  imageUrl?: string
) {
  try {
    await checkAccess(projectId);

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        status: TaskStatus.OPEN,
        dueDate,
        assignedTo,
        priority, 
        imageUrl,
      },
    });

    revalidatePath(`/project/${projectId}/kanban`);
    
    // Notify assignee if assigned
    if (assignedTo) {
        // We need to fetch the project title for context
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true } });
        await createNotification(
            assignedTo,
            "TASK_ASSIGNED",
            `You have been assigned a new task: "${title}" in project "${project?.title || 'Unknown'}"`,
            "New Task Assigned",
            `/project/${projectId}/kanban`
        );
    }

    return { success: true, task };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus) {
  try {
    await checkAccess(projectId);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath(`/project/${projectId}/kanban`);

    // Notify project owner if task is completed
    if (status === TaskStatus.DONE) {
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true, creatorId: true } });
        if (project) {
             await createNotification(
                project.creatorId,
                "TASK_COMPLETED",
                `Task "${task.title}" in "${project.title}" has been marked as DONE.`,
                "Task Completed",
                `/project/${projectId}/kanban`
            );
        }
    }

    return { success: true, task };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return { success: false, error: "Failed to update task status" };
  }
}

export async function updateTask(
    taskId: string, 
    projectId: string, 
    data: { 
        title?: string; 
        description?: string; 
        dueDate?: Date; 
        assignedTo?: string;
        priority?: TaskPriority;
        imageUrl?: string;
    }
) {
    try {
      await checkAccess(projectId);
  
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            assignedTo: data.assignedTo,
            priority: data.priority,
            imageUrl: data.imageUrl,
        },
      });
  
      revalidatePath(`/project/${projectId}/kanban`);
      return { success: true, task };
    } catch (error) {
      console.error("Failed to update task:", error);
      return { success: false, error: "Failed to update task" };
    }
}

export async function deleteTask(taskId: string, projectId: string) {
  try {
    await checkAccess(projectId);

    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath(`/project/${projectId}/kanban`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}
