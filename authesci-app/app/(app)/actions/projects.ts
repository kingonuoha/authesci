"use server";

import { logActivity, logProjectActivity } from "@/lib/logger";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/service";
import { sendEmail } from "@/lib/mail";
// We'll use generic templates for now or create new ones if needed.
// Assuming we have a generic notification email or similar.
import { projectCompletedEmail, projectConfirmationEmail, projectInvitationEmail } from "@/lib/email/templates"; 

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
    await logActivity(profile.id, "MARK_PROJECT_COMPLETE", "SUCCESS", `Project ${projectId} marked as complete`);
    await logProjectActivity(projectId, profile.id, "PROJECT_MARKED_COMPLETE", { projectTitle: project.title });
    return { success: true };
  } catch (error) {
    console.error("Error marking project complete:", error);
    return { error: "Failed to update project status." };
  }
}

export async function confirmProjectCompletion(projectId: string) {
  // ... existing code ...
  // (Assuming context is preserving the middle parts, but replace_file_content works on chunks. 
  // I need to be careful not to replace the whole function logic with placeholders if I don't provide it.
  // I should probably do separate edits for safety, or use multi_replace.
  // "Use this tool ONLY when you are making a SINGLE CONTIGUOUS block of edits".
  // Okay, I will do separate calls or use multi_replace. usage says:
  // "To edit multiple, non-adjacent lines of code in the same file, make a single call to the multi_replace_file_content tool."
  // Perfect.)

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
    // 2. Release Payment or Create if missing
    const payment = project.payments.find(p => p.status === "FUNDED");
    
    if (payment) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "RELEASED" }
        });

        // Create Transaction Record (Pending Payout)
        await prisma.transaction.create({
            data: {
                userId: payment.scientistId,
                type: "PAYOUT",
                amount: payment.scientistAmount,
                status: "PENDING",
                description: `Payout pending for project: ${project.title}`,
                metadata: { projectId: project.id, paymentId: payment.id }
            }
        });

    } else {
        // Create a new payment record if none exists (e.g. legacy projects or manual setup)
        // We assume the budget is the total amount
        const amount = Number(project.budget) || 0;
        if (amount > 0) {
            const platformFee = amount * 0.20;
            const scientistAmount = amount - platformFee;
            
            // Find scientist
            const scientistId = project.collaborators.find(c => c.role === "SCIENTIST")?.userId;
            
            if (scientistId) {
                const newPayment = await prisma.payment.create({
                    data: {
                        projectId: project.id,
                        employerId: project.creatorId,
                        scientistId: scientistId,
                        amount: amount,
                        platformFee: platformFee,
                        scientistAmount: scientistAmount,
                        status: "RELEASED", // Immediately released as we are completing the project
                    }
                });

                // Create Transaction Record (Pending Payout)
                await prisma.transaction.create({
                    data: {
                        userId: scientistId,
                        type: "PAYOUT",
                        amount: scientistAmount,
                        status: "PENDING",
                        description: `Payout pending for project: ${project.title}`,
                        metadata: { projectId: project.id, paymentId: newPayment.id }
                    }
                });
            }
        }
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
    await logActivity(profile.id, "CONFIRM_PROJECT_COMPLETION", "SUCCESS", `Project ${projectId} completion confirmed`);
    await logProjectActivity(projectId, profile.id, "PROJECT_COMPLETED", { projectTitle: project.title });
    return { success: true };

  } catch (error) {
    console.error("Error confirming project completion:", error);
    return { error: "Failed to confirm completion." };
  }
}

export async function inviteCollaborator(projectId: string, email: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: "Profile not found" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true }
  });

  if (!project) return { error: "Project not found" };

  // Check if user is a collaborator on this project or admin
  const isMember = project.collaborators.some(c => c.userId === profile.id);
  const isAdmin = profile.role === "ADMIN";

  if (!isMember && !isAdmin) {
    return { error: "You must be a member of this project to invite collaborators." };
  }

  // Find user to invite
  const invitee = await prisma.profile.findUnique({ where: { email } });
  if (!invitee) {
    return { error: "User with this email not found on the platform." };
  }

  // Check if already a collaborator
  const existing = project.collaborators.find(c => c.userId === invitee.id);
  if (existing) {
    return { error: "User is already a collaborator." };
  }

  try {
    await prisma.collaborator.create({
      data: {
        projectId,
        userId: invitee.id,
        role: "COLLABORATOR",
        joinedAt: new Date()
      }
    });

    await createNotification(
      invitee.id,
      "PROJECT_INVITATION",
      `You have been added as a collaborator to "${project.title}".`,
      "New Project Invitation",
      `/project/${projectId}`
    );

    // Send Email to Invitee
    try {
        await sendEmail({
            to: invitee.email,
            subject: `Invitation to Collaborate: ${project.title}`,
            html: projectInvitationEmail(
                invitee.fullName || invitee.email, 
                profile.fullName || profile.email, 
                project.title, 
                projectId
            ),
        });
    } catch (e) {
        console.error("Failed to send invitation email", e);
    }

    revalidatePath(`/project/${projectId}`);
    await logProjectActivity(projectId, profile.id, "COLLABORATOR_INVITED", { inviteeEmail: invitee.email, inviteeName: invitee.fullName });
    return { success: true };
  } catch (error) {
    console.error("Failed to invite collaborator:", error);
    return { error: "Failed to add collaborator." };
  }
}

export async function getProjectActivity(projectId: string, limit: number = 10) {
   try {
       const logs = await prisma.projectActivity.findMany({
           where: {
               projectId: projectId
           },
           orderBy: { createdAt: 'desc' },
           take: limit,
           include: { user: { select: { fullName: true, avatarUrl: true } } }
       });
       return { success: true, data: logs };
   } catch (error) {
       console.error("Failed to fetch activity:", error);
       return { success: false, error: "Failed to fetch activity" };
   }
}
