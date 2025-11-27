"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProjectStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications/service";
import { sendEmail } from "@/lib/mail";
// We'll use generic templates for now or create new ones if needed.
// Assuming we have a generic notification email or similar.
import { projectCompletedEmail, projectConfirmationEmail } from "@/lib/email/templates"; 

export async function markProjectAsComplete(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
      creator: true, // Employer
    }
  });

  if (!project) {
    return { error: "Project not found" };
  }

  // Verify user is a scientist collaborator
  const isScientist = project.collaborators.some(
    c => c.userId === user.id && c.role === "SCIENTIST"
  );

  // We need to map the user.id (Supabase Auth ID) to the Profile ID used in Collaborator table?
  // Wait, Collaborator.userId refers to Profile.id.
  // So we need to fetch the profile first.
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: "Profile not found" };

  const collaborator = project.collaborators.find(c => c.userId === profile.id);
  
  if (!collaborator || collaborator.role !== "SCIENTIST") {
    return { error: "Only the assigned scientist can mark the project as complete." };
  }

  if (project.status !== "ACTIVE") {
    return { error: "Project is not active." };
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "PENDING_COMPLETION" }
    });

    // Notify Employer
    await createNotification(
      project.creatorId,
      "PROJECT_UPDATE",
      `Scientist has marked "${project.title}" as complete. Please review and confirm.`,
      "Project Completion Pending",
      `/employer/projects/${projectId}`
    );

    // Send Email to Employer
    try {
        await sendEmail({
            to: project.creator.email,
            subject: `Action Required: Project Completion - ${project.title}`,
            html: projectCompletedEmail(project.creator.fullName, project.title, profile.fullName, projectId), 
        });
    } catch (e) {
        console.error("Failed to send email", e);
    }

    revalidatePath(`/scientist/projects/${projectId}`);
    revalidatePath(`/employer/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error marking project complete:", error);
    return { error: "Failed to update project status." };
  }
}

export async function confirmProjectCompletion(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: "Profile not found" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        include: { user: true }
      },
      payments: true,
    }
  });

  if (!project) {
    return { error: "Project not found" };
  }

  if (project.creatorId !== profile.id) {
    return { error: "Only the project owner can confirm completion." };
  }

  if (project.status !== "PENDING_COMPLETION") {
    return { error: "Project is not pending completion." };
  }

  try {
    // 1. Update Project Status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED" }
    });

    // 2. Release Payment
    // Find the pending/funded payment
    const payment = project.payments.find(p => p.status === "FUNDED");
    if (payment) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "RELEASED" }
        });
    }

    // 3. Notify Scientist
    const scientist = project.collaborators.find(c => c.role === "SCIENTIST")?.user;
    if (scientist) {
        await createNotification(
            scientist.id,
            "PROJECT_COMPLETED",
            `Project "${project.title}" has been confirmed as complete. Payment released.`,
            "Project Completed",
            `/scientist/projects/${projectId}`
        );

        // Send Email to Scientist
        try {
            await sendEmail({
                to: scientist.email,
                subject: `Project Completed: ${project.title}`,
                html: projectConfirmationEmail(scientist.fullName, project.title, projectId),
            });
        } catch (e) {
            console.error("Failed to send email", e);
        }
    }

    // 4. Notify Employer (Confirmation)
    await createNotification(
        profile.id,
        "PROJECT_COMPLETED",
        `You have confirmed completion for "${project.title}".`,
        "Project Completed",
        `/employer/projects/${projectId}`
    );

     // Send Email to Employer
     try {
        await sendEmail({
            to: profile.email,
            subject: `Project Completed: ${project.title}`,
            html: projectConfirmationEmail(profile.fullName, project.title, projectId), // Reusing same template or similar
        });
    } catch (e) {
        console.error("Failed to send email", e);
    }

    revalidatePath(`/scientist/projects/${projectId}`);
    revalidatePath(`/employer/projects/${projectId}`);
    return { success: true };

  } catch (error) {
    console.error("Error confirming project completion:", error);
    return { error: "Failed to confirm completion." };
  }
}
