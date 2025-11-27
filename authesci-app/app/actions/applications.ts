"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import cloudinary from "@/lib/cloudinary";
import { createProjectFromApplication } from "@/lib/services/project";
import { calculateMatchScore } from "@/lib/ai/service";
import { sendEmail } from "@/lib/mail";
import { applicationReceivedEmail, newApplicantEmail, applicationStatusUpdateEmail, applicationRejectedEmail } from "@/lib/email/templates";
import { createNotification } from "@/lib/notifications/service";

const applicationSchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
});

export type ApplicationState = {
  status: "success" | "error" | "idle";
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitApplication(prevState: ApplicationState, formData: FormData): Promise<ApplicationState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be logged in to apply." };
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    return { status: "error", message: "Profile not found. Please complete your profile first." };
  }

  // Validate file
  const file = formData.get("resume") as File;
  let resumeUrl = profile.cvUrl;

  if (file && file.size > 0) {
    // If file is provided, upload it
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const resourceType = isPdf ? "raw" : "auto";

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: "authesci/resumes", 
            resource_type: resourceType, 
            access_mode: "public",
            use_filename: true,
            unique_filename: true,
            filename_override: file.name
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      if (!uploadResult?.secure_url) {
        throw new Error("Upload failed");
      }
      resumeUrl = uploadResult.secure_url;
    } catch (error) {
       console.error("Upload error:", error);
       return { status: "error", message: "Failed to upload resume." };
    }
  } else if (!resumeUrl) {
    // If no file provided and no profile CV, return error
    return { status: "error", message: "Resume is required. Please upload one or add it to your profile." };
  }

  try {
    const rawData = {
      jobId: formData.get("jobId"),
      coverLetter: formData.get("coverLetter"),
    };

    const validatedFields = applicationSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        status: "error",
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { jobId, coverLetter } = validatedFields.data;

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: profile.id,
        },
      },
    });

    if (existingApplication) {
      return { status: "error", message: "You have already applied for this job." };
    }

    // Fetch job for AI matching AND employer email
    const job = await prisma.job.findUnique({ 
      where: { id: jobId },
      include: { employer: true } 
    });
    if (!job) {
        return { status: "error", message: "Job not found." };
    }

    // Calculate AI Match Score
    let aiMatchScore = null;
    let aiIntel = null;
    
    try {
        const matchResult = await calculateMatchScore(profile, job.description);
        if (matchResult) {
            aiMatchScore = matchResult.matchScore;
            aiIntel = matchResult;
        }
    } catch (e) {
        console.error("AI Match failed", e);
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: profile.id,
        coverLetter,
        resumeUrl: resumeUrl!, // We know it's not null because of the check above
        status: ApplicationStatus.PENDING,
        aiMatchScore,
        aiIntel,
      },
    });

    // Send Emails & Notifications
    try {
      // 1. Email to Applicant
      await sendEmail({
        to: profile.email,
        subject: `Application Received: ${job.title}`,
        html: applicationReceivedEmail(profile.fullName, job.title, job.id),
      });

      // 2. Email to Employer
      await sendEmail({
        to: job.employer.email,
        subject: `New Applicant for ${job.title}`,
        html: newApplicantEmail(job.employer.fullName, job.title, profile.fullName, job.id, aiMatchScore || undefined),
      });

      // 3. In-App Notification to Employer
      await createNotification(
        job.employerId,
        "NEW_APPLICANT",
        `${profile.fullName} applied for ${job.title}`,
        "New Applicant",
        `/employer/jobs/${job.id}/applicants`
      );

    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError);
      // Don't fail the request if email fails
    }

    revalidatePath(`/jobs/${jobId}`);
    return { status: "success", message: "Application submitted successfully!" };

  } catch (error) {
    console.error("Application error:", error);
    return { status: "error", message: "Failed to submit application." };
  }
}


export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile || profile.role !== "EMPLOYER") return { error: "Unauthorized" };

    // Verify ownership of the job
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { 
          job: true,
          applicant: true 
        }
    });

    if (!application || application.job.employerId !== profile.id) {
        return { error: "Unauthorized" };
    }

    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status: newStatus }
    });

    // Send Email & Notification to Applicant
    try {
      await sendEmail({
        to: application.applicant.email,
        subject: `Application Update: ${application.job.title}`,
        html: applicationStatusUpdateEmail(application.applicant.fullName, application.job.title, newStatus, application.job.id),
      });

      await createNotification(
        application.applicantId,
        "STATUS_UPDATE",
        `Your application for ${application.job.title} is now ${newStatus}`,
        "Application Update",
        `/dashboard` // Or wherever applicants view their status
      );
    } catch (emailError) {
      console.error("Failed to send status update notification:", emailError);
    }

    if (newStatus === ApplicationStatus.ACCEPTED) {
      try {
        await createProjectFromApplication(applicationId);

        // Notify other applicants
        const otherApplications = await prisma.application.findMany({
            where: {
                jobId: application.jobId,
                id: { not: applicationId },
                status: "PENDING"
            },
            include: { applicant: true }
        });

        for (const app of otherApplications) {
            await prisma.application.update({
                where: { id: app.id },
                data: { status: "REJECTED", rejectedAt: new Date() }
            });

            await createNotification(
                app.applicantId,
                "APPLICATION_UPDATE",
                `Someone else has been selected for ${application.job.title}. Check out other opportunities!`,
                "Application Update",
                "/jobs"
            );

            try {
                await sendEmail({
                    to: app.applicant.email,
                    subject: `Update on your application for ${application.job.title}`,
                    html: applicationRejectedEmail(app.applicant.fullName, application.job.title)
                });
            } catch (e) { console.error("Failed to send rejection email", e); }
        }

      } catch (error) {
        console.error("Failed to create project or notify others:", error);
        // Note: We might want to revert the application status if project creation fails,
        // but for now we just log it. The user can try again or we can handle it manually.
        return { error: "Application accepted but failed to create project workspace." };
      }
    }

    revalidatePath(`/employer/jobs/${application.job.id}/applicants`);
    return { success: true };
}
