"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/service";
import { extractTextFromFile } from "@/lib/utils/file-processing";
import { generateEmbedding } from "@/lib/ai/embedding";
import { logProjectActivity } from "@/lib/logger";

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
    // ... existing code ...
    const file = await prisma.projectFile.create({
      data: {
        projectId,
        uploadedBy: profile.id,
        fileName,
        fileUrl,
        fileType,
        fileSize,
      },
    });

    await logProjectActivity(projectId, profile.id, "FILE_UPLOADED", { fileId: file.id, fileName, fileSize });

    // RAG Integration: Extract text and generate embedding asynchronously
    // ... existing code ...
    (async () => {
      try {
        const text = await extractTextFromFile(fileUrl, fileType);
        if (text) {
          // Truncate text if too long for embedding model (usually 2048 or 8192 tokens, safe limit ~8000 chars for now)
          const truncatedText = text.slice(0, 8000); 
          const embedding = await generateEmbedding(truncatedText);

          // Update with content and vector
          // Note: Prisma doesn't support vector type directly in update yet, so use raw query
          await prisma.$executeRaw`
            UPDATE "ProjectFile"
            SET "content" = ${text},
                "summary" = ${text.slice(0, 200) + '...'},
                "aiFeatureVector" = ${JSON.stringify(embedding)}::vector
            WHERE "id" = ${file.id}
          `;
        }
      } catch (error) {
        console.error("Error processing file for RAG:", error);
      }
    })();

    revalidatePath(`/project/${projectId}/files`);

    // Notify other collaborators about new file
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
            "SYSTEM_ALERT",
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
