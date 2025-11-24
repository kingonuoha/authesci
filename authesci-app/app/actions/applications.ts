"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";
import cloudinary from "@/lib/cloudinary";
import { createProjectFromApplication } from "@/lib/services/project";

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

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "authesci/resumes", resource_type: "auto", access_mode: "public" },
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

  try{
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

    await prisma.application.create({
      data: {
        jobId,
        applicantId: profile.id,
        coverLetter,
        resumeUrl: resumeUrl!, // We know it's not null because of the check above
        status: ApplicationStatus.PENDING,
      },
    });

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
        include: { job: true }
    });

    if (!application || application.job.employerId !== profile.id) {
        return { error: "Unauthorized" };
    }

    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status: newStatus }
    });

    if (newStatus === ApplicationStatus.ACCEPTED) {
      try {
        await createProjectFromApplication(applicationId);
      } catch (error) {
        console.error("Failed to create project:", error);
        // Note: We might want to revert the application status if project creation fails,
        // but for now we just log it. The user can try again or we can handle it manually.
        return { error: "Application accepted but failed to create project workspace." };
      }
    }

    revalidatePath(`/employer/jobs/${application.job.id}/applicants`);
    return { success: true };
}
