"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createNotification } from "@/lib/notifications/service";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

import { sendEmail } from "@/lib/mail";
import { projectFundedEmail, projectFundingConfirmedEmail } from "@/lib/email/templates";

export type PaymentState = {
  status: "success" | "error" | "idle";
  message: string;
  data?: any;
};

export async function getBanks() {
  try {
    const response = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });
    const data = await response.json();
    if (data.status) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching banks:", error);
    return [];
  }
}

export async function resolveAccount(accountNumber: string, bankCode: string) {
  try {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const data = await response.json();
    if (data.status) {
      return { success: true, account_name: data.data.account_name };
    }
    return { success: false, message: data.message };
  } catch (error) {
    console.error("Error resolving account:", error);
    return { success: false, message: "Failed to resolve account" };
  }
}

const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  accountName: z.string().min(1, "Account name is required"),
  bankCode: z.string().optional(), // Not stored in DB but needed for recipient creation
});

export async function saveBankDetails(
  prevState: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You must be logged in to save bank details.",
    };
  }

  const rawData = {
    bankName: formData.get("bankName"),
    accountNumber: formData.get("accountNumber"),
    accountName: formData.get("accountName"),
    bankCode: formData.get("bankCode"),
  };

  const validatedFields = bankDetailsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      status: "error",
      message: "Validation failed. Please check your inputs.",
    };
  }

  const { bankName, accountNumber, accountName, bankCode } = validatedFields.data;

  try {
    // Create Transfer Recipient in Paystack
    let recipientCode = null;
    if (PAYSTACK_SECRET_KEY && bankCode) {
        try {
            const response = await fetch("https://api.paystack.co/transferrecipient", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "nuban",
                    name: accountName,
                    account_number: accountNumber,
                    bank_code: bankCode,
                    currency: "NGN",
                }),
            });
            const data = await response.json();
            if (data.status) {
                recipientCode = data.data.recipient_code;
            } else {
                console.error("Paystack recipient creation failed:", data.message);
            }
        } catch (e) {
            console.error("Error creating Paystack recipient:", e);
        }
    }

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        bankName,
        accountNumber,
        accountName,
        recipientCode,
      },
    });

    revalidatePath("/scientist/wallet");
    
    await createNotification(
        profile.id,
        "SYSTEM_ALERT",
        "Your bank details have been updated successfully.",
        "Bank Details Updated",
        "/scientist/wallet"
    );

    return {
      status: "success",
      message: "Bank details saved successfully!",
    };
  } catch (error) {
    console.error("Save bank details error:", error);
    return {
      status: "error",
      message: "Failed to save bank details.",
    };
  }
}

export async function deleteBankDetails() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You must be logged in.",
    };
  }

  try {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        bankName: null,
        accountNumber: null,
        accountName: null,
        recipientCode: null,
      },
    });

    revalidatePath("/scientist/wallet");

    return {
      status: "success",
      message: "Bank details removed.",
    };
  } catch (error) {
    console.error("Delete bank details error:", error);
    return {
      status: "error",
      message: "Failed to remove bank details.",
    };
  }
}

export async function fundProject(
  applicationId: string,
  finalPrice: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Unauthorized or missing email" };
  }

  try {
    // 1. Get Application details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        applicant: true,
      },
    });

    if (!application) {
      return { error: "Application not found" };
    }

    const job = application.job;
    
    // 2. Verify Employer
    const employerProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!employerProfile || employerProfile.id !== job.employerId) {
      return { error: "Unauthorized" };
    }

    // 3. Create Project (if not exists? No, we are creating a new one)
    // Check if project already exists for this job/application to avoid duplicates?
    // For now, assume new.

    const project = await prisma.project.create({
      data: {
        creatorId: employerProfile.id,
        title: job.title,
        description: job.description,
        budget: finalPrice,
        status: "ACTIVE", // As per PRD, but effectively pending payment
      },
    });

    // 4. Add Employer as Collaborator (Owner)
    await prisma.collaborator.create({
      data: {
        projectId: project.id,
        userId: employerProfile.id,
        role: "OWNER",
        permissions: ["admin", "view", "edit", "delete"],
        status: "ACTIVE",
      },
    });

    // 5. Add Scientist as Collaborator
    await prisma.collaborator.create({
      data: {
        projectId: project.id,
        userId: application.applicantId,
        role: "SCIENTIST",
        permissions: ["view", "edit"], // Default permissions
        status: "ACTIVE",
      },
    });

    // 6. Create Payment Record
    const amount = finalPrice;
    const platformFee = amount * 0.10;
    const scientistAmount = amount * 0.90;

    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        employerId: employerProfile.id,
        scientistId: application.applicantId,
        amount: amount,
        platformFee: platformFee,
        scientistAmount: scientistAmount,
        status: "PENDING",
      },
    });

    // 7. Initialize Paystack Transaction
    if (!PAYSTACK_SECRET_KEY) {
        return { error: "Payment configuration missing" };
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100), // Amount in kobo
        currency: process.env.NEXT_PUBLIC_CURRENCY || 'NGN',
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
          projectId: project.id,
          paymentId: payment.id,
          jobId: job.id,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return { error: data.message || "Payment initialization failed" };
    }

    // Update Payment with reference
    await prisma.payment.update({
      where: { id: payment.id },
      data: { reference: data.data.reference },
    });
    
    // Update Job with final price and status
    await prisma.job.update({
        where: { id: job.id },
        data: { 
            finalPrice: finalPrice,
            status: "PENDING_PAYMENT" 
        }
    });

    return { url: data.data.authorization_url };

  } catch (error) {
    console.error("Fund project error:", error);
    return { error: "Something went wrong" };
  }
}

export async function verifyPayment(reference: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  if (!PAYSTACK_SECRET_KEY) {
    return { success: false, message: "Payment configuration missing" };
  }

  try {
    // 1. Verify with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Payment verification failed" };
    }

    const { metadata, amount } = data.data;
    const { projectId, paymentId, jobId } = metadata;

    // 2. Update Payment Record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { 
        project: true,
        employer: true,
        scientist: true
      }
    });

    if (!payment) {
      return { success: false, message: "Payment record not found" };
    }

    if (payment.status === "FUNDED") {
        return { success: true, message: "Payment already verified", projectId };
    }

    // Verify amount (Paystack returns kobo)
    if (amount !== Math.round(payment.amount.toNumber() * 100)) {
        return { success: false, message: "Payment amount mismatch" };
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FUNDED",
      },
    });

    // 3. Update Project Status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "ACTIVE", // Confirm project is active now that it's funded
      },
    });
    
    // 4. Update Job Status to CLOSED
    if (jobId) {
        await prisma.job.update({
            where: { id: jobId },
            data: { status: "CLOSED" }
        });
    }

    // 5. Notify Scientist about funding
    await createNotification(
        payment.scientistId,
        "PAYMENT_SUCCESS",
        `Project "${payment.project.title}" has been funded! You can now start working.`,
        "Project Funded",
        `/project/${projectId}`
    );

    // Send Email to Scientist
    try {
        await sendEmail({
            to: payment.scientist.email,
            subject: `Project Funded: ${payment.project.title}`,
            html: projectFundedEmail(payment.scientist.fullName, payment.project.title, projectId),
        });
    } catch (e) {
        console.error("Failed to send email", e);
    }

    // 6. Notify Employer
    await createNotification(
        payment.employerId,
        "PAYMENT_SUCCESS",
        `Funding for "${payment.project.title}" was successful.`,
        "Payment Confirmed",
        `/project/${projectId}`
    );

    // Send Email to Employer
    try {
        await sendEmail({
            to: payment.employer.email,
            subject: `Payment Confirmed: ${payment.project.title}`,
            html: projectFundingConfirmedEmail(payment.employer.fullName, payment.project.title, projectId),
        });
    } catch (e) {
        console.error("Failed to send email", e);
    }

    return { success: true, message: "Payment verified successfully", projectId };

  } catch (error) {
    console.error("Verify payment error:", error);
    return { success: false, message: "Internal server error during verification" };
  }
}
