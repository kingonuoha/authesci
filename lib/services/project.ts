import { prisma } from "@/lib/prisma";
import { ProjectStatus, CollaboratorStatus, JobStatus, ApplicationStatus, TaskStatus, TaskPriority } from "@prisma/client";

/**
 * Creates a new project from an accepted job application.
 * Adds the Employer (Job Owner) and Scientist (Applicant) as collaborators.
 * Updates the Job status to CLOSED.
 */
export async function createProjectFromApplication(applicationId: string) {
  // 1. Fetch Application with Job and Applicant details
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: true,
      applicant: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // 2. Check if project already exists for this application (idempotency check)
  // We can check if there is a project created by this employer with the same title, 
  // and containing this applicant. 
  // However, a simpler check is if the job is already closed, maybe we shouldn't create another?
  // But for now, let's just proceed. The PRD says "System automatically creates a Project".

  // 3. Create Project
  // We use a transaction to ensure all related records are created/updated together.
  const project = await prisma.$transaction(async (tx) => {
    // Create the project
    const newProject = await tx.project.create({
      data: {
        title: application.job.title,
        description: application.job.description, // Inherit description
        creatorId: application.job.employerId,
        status: ProjectStatus.ACTIVE,
        budget: application.job.salaryRange ? undefined : undefined, // Could parse salary range if needed, but leaving null for now
      },
    });

    // Add Employer as Collaborator (Owner)
    await tx.collaborator.create({
      data: {
        projectId: newProject.id,
        userId: application.job.employerId,
        role: "OWNER",
        permissions: ["admin", "view", "edit", "delete"],
        status: CollaboratorStatus.ACTIVE,
      },
    });

    // Add Scientist as Collaborator (Member)
    await tx.collaborator.create({
      data: {
        projectId: newProject.id,
        userId: application.applicantId,
        role: "MEMBER",
        permissions: ["view", "edit"], // Can view and edit tasks/files
        status: CollaboratorStatus.ACTIVE,
      },
    });

    // Create Payment Record (Escrow)
    // Assuming 20% platform fee for now
    const amount = application.job.finalPrice ? Number(application.job.finalPrice) : 0;
    const platformFee = amount * 0.20;
    const scientistAmount = amount - platformFee;

    if (amount > 0) {
        await tx.payment.create({
            data: {
                projectId: newProject.id,
                employerId: application.job.employerId,
                scientistId: application.applicantId,
                amount: amount,
                platformFee: platformFee,
                scientistAmount: scientistAmount,
                status: "FUNDED", // Employer has already paid when activating the job
            }
        });
    }

    // Create Tasks for Scientist
    const scientistDeadline = new Date();
    scientistDeadline.setDate(scientistDeadline.getDate() + 5);

    await tx.task.createMany({
      data: [
        {
          title: "Get to know the project scope",
          description: "Review the project details and scope.",
          projectId: newProject.id,
          assignedTo: application.applicantId,
          status: TaskStatus.OPEN,
          priority: TaskPriority.MEDIUM,
          dueDate: scientistDeadline,
        },
        {
          title: "Understand the requirement",
          description: "Analyze the project requirements.",
          projectId: newProject.id,
          assignedTo: application.applicantId,
          status: TaskStatus.OPEN,
          priority: TaskPriority.MEDIUM,
          dueDate: scientistDeadline,
        },
        {
          title: "Review Documentation",
          description: "Read through any provided documentation.",
          projectId: newProject.id,
          assignedTo: application.applicantId,
          status: TaskStatus.OPEN,
          priority: TaskPriority.MEDIUM,
          dueDate: scientistDeadline,
        },
      ],
    });

    // Create Task for Employer (Fund Project - Marked as DONE)
    await tx.task.create({
      data: {
        title: "Fund the project",
        description: "Ensure the project is funded.",
        projectId: newProject.id,
        assignedTo: application.job.employerId,
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date(),
      },
    });

    // Update Job Status to CLOSED
    await tx.job.update({
      where: { id: application.jobId },
      data: { status: JobStatus.CLOSED },
    });

    // Reject all other PENDING applications for this job
    await tx.application.updateMany({
      where: {
        jobId: application.jobId,
        id: { not: applicationId }, // Exclude the accepted application
        status: ApplicationStatus.PENDING,
      },
      data: {
        status: ApplicationStatus.REJECTED,
        rejectedAt: new Date(),
      },
    });

    return newProject;
  });

  return project;
}

/**
 * Gets the count of active projects for a specific user.
 */
export async function getActiveProjectCount(userId: string) {
  const count = await prisma.project.count({
    where: {
      status: ProjectStatus.ACTIVE,
      collaborators: {
        some: {
          userId: userId,
          status: CollaboratorStatus.ACTIVE,
        },
      },
    },
  });
  return count;
}
