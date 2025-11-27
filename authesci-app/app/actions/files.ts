"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/service";

export async function saveFileRecord(projectId: string, fileName: string, fileUrl: string, fileType: string, fileSize: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: "Profile not found" };

  const collaborator = await prisma.collaborator.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: profile.id,
      },
    },
  });

  if (!collaborator) return { error: "Unauthorized" };

  try {
    const file = await prisma.projectFile.create({
      data: {
        projectId,
        uploadedBy: profile.id,
        fileName,
        fileUrl, // This should be the public URL or just the key if we construct URL on client
        fileType,
        fileSize,
      },
    });

    revalidatePath(`/project/${projectId}/files`);

    // Notify other collaborators about new file
    // Get all collaborators except uploader
    const otherCollaborators = await prisma.collaborator.findMany({
        where: {
            projectId,
            userId: { not: profile.id }
        }
    });

    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true } });

    for (const collab of otherCollaborators) {
        await createNotification(
            collab.userId,
            "SYSTEM_ALERT", // Or a new type FILE_UPLOADED
            `${profile.fullName} uploaded a new file "${fileName}" to project "${project?.title}"`,
            "New File Uploaded",
            `/project/${projectId}/files`
        );
    }

    return { success: true, file };
  } catch (error) {
    console.error("Failed to save file record:", error);
    return { error: "Failed to save file record" };
  }
}
