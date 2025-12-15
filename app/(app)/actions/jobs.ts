"use server";

import { logActivity } from "@/lib/logger";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { JobType, JobStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications/service";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/mail";
import { newJobAlertEmail } from "@/lib/email/templates";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string(), // Newline separated string
  category: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  location: z.string().min(1, "Location is required"),
  salaryRange: z.string().min(1, "Salary is required"),
  screeningQuestions: z.string().optional(),
});

export type JobState = {
  status: "success" | "error" | "idle";
  message: string;
  errors?: Record<string, string[]>;
  jobId?: string;
  paystackUrl?: string; // For redirecting to payment
};

export async function createJob(prevState: JobState, formData: FormData): Promise<JobState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be logged in to post a job." };
  }

  // Get the profile to ensure it's an employer
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile || profile.role !== "EMPLOYER") {
    return { status: "error", message: "Only employers can post jobs." };
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    category: formData.get("category") || undefined,
    jobType: formData.get("jobType"),
    location: formData.get("location"),
    salaryRange: formData.get("salaryRange"),
    screeningQuestions: formData.get("screeningQuestions"),
  };

  const validatedFields = jobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, requirements, category, jobType, location, salaryRange, screeningQuestions } = validatedFields.data;

  const requirementsArray = requirements.split("\n").map(r => r.trim()).filter(Boolean);
  
  let screeningQuestionsJson = null;
  if (screeningQuestions) {
      try {
          screeningQuestionsJson = JSON.parse(screeningQuestions);
      } catch (e) {
          console.error("Failed to parse screening questions", e);
      }
  }

  try {
    const paymentAmount = formData.get("paymentAmount");
    // Default to 5000 if not provided or invalid, otherwise use the max salary provided
    const amountInKobo = paymentAmount ? parseFloat(paymentAmount.toString()) * 100 : 5000 * 100; 
    const finalPrice = amountInKobo / 100;

    // Create job with ACTIVE status immediately (payment happens later on applicant selection)
    const job = await prisma.job.create({
      data: {
        employerId: profile.id,
        title,
        description,
        requirements: requirementsArray,
        category,
        jobType,
        location,
        salaryRange,
        finalPrice,
        status: JobStatus.ACTIVE, // Directly active
        screeningQuestions: screeningQuestionsJson || undefined,
      },
    });

    // Notify employer about job creation
    await createNotification(
        profile.id,
        "SYSTEM_ALERT",
        `Job "${job.title}" created successfully.`,
        "Job Created",
        `/employer/jobs/${job.id}`
    );

    await logActivity(profile.id, "CREATE_JOB", "SUCCESS", `Job "${title}" created`, { jobId: job.id });

    // Generate and store embedding
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === "true") {
        try {
            const { generateEmbeddings } = await import("@/lib/ai/service");
            const textToEmbed = `${title} ${description} ${requirementsArray.join(" ")}`;
            const embedding = await generateEmbeddings(textToEmbed);
            
            if (embedding) {
                await prisma.$executeRaw`
                    UPDATE jobs
                    SET "aiFeatureVector" = ${embedding}::vector
                    WHERE id = ${job.id}
                `;
            }
        } catch (e) {
            console.error("Failed to generate/store embedding:", e);
        }
    }

    // Determine return path - redirect to the job dashboard or job details
    revalidatePath("/employer/jobs");
    return {
      status: "success",
      message: "Job posted successfully!",
      jobId: job.id,
      // No paystackUrl returned
    };

  } catch (error) {
    console.error("Create job error:", error);
    return { status: "error", message: "Failed to create job." };
  }
}

export async function updateJob(prevState: JobState, formData: FormData): Promise<JobState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be logged in to update a job." };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile || profile.role !== "EMPLOYER") {
    return { status: "error", message: "Only employers can update jobs." };
  }

  const jobId = formData.get("jobId") as string;
  if (!jobId) {
    return { status: "error", message: "Job ID is required." };
  }

  // Verify ownership
  const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
  if (!existingJob) {
    return { status: "error", message: "Job not found." };
  }
  if (existingJob.employerId !== profile.id) {
    return { status: "error", message: "Unauthorized." };
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    category: formData.get("category") || undefined,
    jobType: formData.get("jobType"),
    location: formData.get("location"),
    salaryRange: formData.get("salaryRange"),
    screeningQuestions: formData.get("screeningQuestions"),
  };

  const validatedFields = jobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, requirements, category, jobType, location, salaryRange, screeningQuestions } = validatedFields.data;
  const requirementsArray = requirements.split("\n").map(r => r.trim()).filter(Boolean);

  let screeningQuestionsJson = null;
  if (screeningQuestions) {
      try {
          screeningQuestionsJson = JSON.parse(screeningQuestions);
      } catch (e) {
          console.error("Failed to parse screening questions", e);
      }
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        title,
        description,
        requirements: requirementsArray,
        category,
        jobType,
        location,
        salaryRange,
        screeningQuestions: screeningQuestionsJson || undefined,
      },
    });

    revalidatePath("/employer/jobs");

    // Notify employer about update
    await createNotification(
        profile.id,
        "SYSTEM_ALERT",
        `Job "${title}" updated successfully.`,
        "Job Updated",
        `/employer/jobs/${jobId}`
    );

    await logActivity(profile.id, "UPDATE_JOB", "SUCCESS", `Job "${title}" updated`, { jobId });

    // Generate and store embedding
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === "true") {
        try {
            const { generateEmbeddings } = await import("@/lib/ai/service");
            const textToEmbed = `${title} ${description} ${requirementsArray.join(" ")}`;
            const embedding = await generateEmbeddings(textToEmbed);
            
            if (embedding) {
                await prisma.$executeRaw`
                    UPDATE jobs
                    SET "aiFeatureVector" = ${embedding}::vector
                    WHERE id = ${jobId}
                `;
            }
        } catch (e) {
            console.error("Failed to generate/store embedding:", e);
        }
    }

    return { status: "success", message: "Job updated successfully!", jobId };
  } catch (error) {
    console.error("Update job error:", error);
    return { status: "error", message: "Failed to update job." };
  }
}

export async function verifyJobPayment(reference: string, jobId: string) {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) return { success: false, message: "Payment config missing" };

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${paystackSecret}` }
        });
        const data = await response.json();

        if (data.status && data.data.status === "success") {
            // Verify metadata matches if needed
            await prisma.job.update({
                where: { id: jobId },
                data: { status: JobStatus.ACTIVE }
            });
            
            // Fetch job to get employer ID
            const job = await prisma.job.findUnique({ where: { id: jobId } });
            if (job) {
                await createNotification(
                    job.employerId,
                    "PAYMENT_SUCCESS",
                    `Payment verified for job "${job.title}". It is now active.`,
                    "Payment Successful",
                    `/employer/jobs/${jobId}`
                );
            }

            await logActivity(job?.employerId || "", "JOB_PAYMENT_VERIFIED", "SUCCESS", `Payment verified for job ${jobId}`, { reference });

            // Notify all scientists about the new job
            try {
                const scientists = await prisma.profile.findMany({
                    where: { role: "SCIENTIST" },
                    select: { email: true, fullName: true }
                });

                // Send emails in parallel (limit concurrency if needed in future)
                await Promise.all(scientists.map(scientist => 
                    sendEmail({
                        to: scientist.email,
                        subject: `New Job Alert: ${job?.title}`,
                        html: newJobAlertEmail(scientist.fullName, job?.title || "New Job", jobId)
                    }).catch(err => console.error(`Failed to send alert to ${scientist.email}`, err))
                ));
            } catch (e) {
                console.error("Failed to send job alerts", e);
            }

            revalidatePath("/jobs");
            revalidatePath("/employer/jobs");
            return { success: true };
        }
        return { success: false, message: "Payment verification failed" };
    } catch (error) {
        console.error("Payment verification error:", error);
        return { success: false, message: "Verification error" };
    }
}

export async function deleteJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return { error: "Profile not found" };

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return { error: "Job not found" };

    if (job.employerId !== profile.id) return { error: "Unauthorized" };

    await prisma.job.delete({ where: { id: jobId } });
    await logActivity(profile.id, "DELETE_JOB", "SUCCESS", `Job ${jobId} deleted`);
    revalidatePath("/employer/jobs");
    return { success: true };
}

export async function initiateJobPayment(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: "error", message: "Unauthorized" };

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return { status: "error", message: "Profile not found" };

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return { status: "error", message: "Job not found" };

    // Calculate amount from job.salaryRange or default
    // Parsing logic similar to createJob
    let amount = 5000 * 100;
    if (job.salaryRange) {
        // Try to extract max number from string like "$50000" or "$50000 - $80000"
        const matches = job.salaryRange.match(/(\d+)/g);
        if (matches && matches.length > 0) {
            const maxVal = Math.max(...matches.map(m => parseInt(m)));
            amount = maxVal * 100;
        }
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
         // Dev mode fallback
         await prisma.job.update({
            where: { id: jobId },
            data: { status: JobStatus.ACTIVE }
        });
        return { status: "success", message: "Job activated (Dev Mode)" };
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/jobs/${job.id}/verify-payment`;

    try {
        const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${paystackSecret}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: profile.email,
                amount,
                callback_url: callbackUrl,
                metadata: {
                    jobId: job.id,
                    employerId: profile.id,
                },
            }),
        });

        const paystackData = await paystackResponse.json();
        if (!paystackData.status) {
            throw new Error(paystackData.message);
        }

        return {
            status: "success",
            paystackUrl: paystackData.data.authorization_url
        };
    } catch (error) {
        console.error("Payment init error:", error);
        return { status: "error", message: "Payment initialization failed" };
    }
}

export async function remixJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: "error", message: "Unauthorized" };

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile || profile.role !== "EMPLOYER") return { status: "error", message: "Unauthorized" };

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return { status: "error", message: "Job not found" };

    if (job.employerId !== profile.id) return { status: "error", message: "Unauthorized" };

    try {
        const newJob = await prisma.job.create({
            data: {
                employerId: profile.id,
                title: `${job.title} (Copy)`,
                description: job.description,
                requirements: job.requirements,
                category: job.category,
                jobType: job.jobType,
                location: job.location,
                salaryRange: job.salaryRange,
                status: JobStatus.DRAFT, // Start as draft
            },
        });

        revalidatePath("/employer/jobs");
        return { status: "success", message: "Job remixed successfully", jobId: newJob.id };
    } catch (error) {
        console.error("Remix job error:", error);
        return { status: "error", message: "Failed to remix job" };
    }
}

export async function getProjectForJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { status: "error", message: "Unauthorized" };

    // Find the accepted application for this job
    const acceptedApp = await prisma.application.findFirst({
        where: {
            jobId: jobId,
            status: "ACCEPTED"
        },
        include: {
            applicant: true
        }
    });

    if (!acceptedApp) {
        return { status: "error", message: "No accepted application found for this job." };
    }

    // Find project where both employer (current user) and applicant are collaborators
    // And title matches job title (heuristic)
    // Or just find project created by this user with this title
    
    // Better: Find project where creator is current user and title is job title
    // AND it has the applicant as a collaborator
    
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return { status: "error", message: "Job not found" };

    const project = await prisma.project.findFirst({
        where: {
            creatorId: job.employerId, // Should be current user's profile id
            title: job.title,
            collaborators: {
                some: {
                    userId: acceptedApp.applicantId
                }
            }
        }
    });

    if (project) {
        return { status: "success", projectId: project.id };
    }

    return { status: "error", message: "Project not found." };
}
