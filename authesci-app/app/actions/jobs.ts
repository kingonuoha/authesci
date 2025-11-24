"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { JobType, JobStatus } from "@prisma/client";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string(), // Newline separated string
  category: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  location: z.string().min(1, "Location is required"),
  salaryRange: z.string().min(1, "Salary is required"),
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
  };

  const validatedFields = jobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, requirements, category, jobType, location, salaryRange } = validatedFields.data;

  const requirementsArray = requirements.split("\n").map(r => r.trim()).filter(Boolean);

  try {
    // Create job with PENDING_PAYMENT status by default for now (or DRAFT)
    // We'll assume all jobs require payment for this batch as per PRD implying Paystack integration
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
        status: JobStatus.PENDING_PAYMENT, 
      },
    });

    // Initialize Paystack Transaction
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
        // Fallback for dev without keys or if free posting is allowed
        console.warn("PAYSTACK_SECRET_KEY not found. Creating job as ACTIVE (Dev Mode).");
        await prisma.job.update({
            where: { id: job.id },
            data: { status: JobStatus.ACTIVE }
        });
        revalidatePath("/jobs");
        revalidatePath("/employer/jobs");
        return { status: "success", message: "Job posted successfully!", jobId: job.id };
    }

    const paymentAmount = formData.get("paymentAmount");
    // Default to 5000 if not provided or invalid, otherwise use the max salary provided
    // Note: This logic assumes the fee is the salary amount as per user request "pay the max"
    // If it's meant to be a fee based on salary, this logic might need adjustment.
    // For now, we follow the instruction "pay the max".
    const amount = paymentAmount ? parseFloat(paymentAmount.toString()) * 100 : 5000 * 100; 
    
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/jobs/${job.id}/verify-payment`;

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
      throw new Error("Paystack initialization failed: " + paystackData.message);
    }

    return {
      status: "success",
      message: "Job created. Redirecting to payment...",
      jobId: job.id,
      paystackUrl: paystackData.data.authorization_url,
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
  };

  const validatedFields = jobSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, description, requirements, category, jobType, location, salaryRange } = validatedFields.data;
  const requirementsArray = requirements.split("\n").map(r => r.trim()).filter(Boolean);

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
      },
    });

    revalidatePath("/employer/jobs");
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
