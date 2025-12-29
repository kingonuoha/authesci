"use server";

import { logActivity } from "@/lib/logger";

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

    await logActivity(profile.id, "SAVE_BANK_DETAILS", "SUCCESS", "Bank details saved");
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

    await logActivity(user.id, "DELETE_BANK_DETAILS", "SUCCESS", "Bank details deleted");
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
        status: "PENDING", // Initial status pending payment verification
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

    // Create Transaction Record (PENDING DEPOSIT)
    await prisma.transaction.create({
        data: {
            userId: employerProfile.id,
            type: "DEPOSIT",
            amount: amount,
            status: "PENDING",
            reference: data.data.reference,
            description: `Project funding deposit for: ${project.title}`,
            metadata: { projectId: project.id, paymentId: payment.id }
        }
    });

    await logActivity(employerProfile.id, "FUND_PROJECT_INIT", "SUCCESS", `Project funding initialized for ${project.id}`, { paymentId: payment.id });
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

    // 3b. Create Default Tasks
    await prisma.task.createMany({
        data: [
            {
                projectId,
                assignedTo: payment.employerId,
                title: "Fund Project",
                description: "Initial funding of the project has been completed.",
                status: "DONE",
                priority: "HIGH"
            },
            {
                projectId,
                assignedTo: payment.scientistId,
                title: "Acknowledge Project",
                description: "Please confirm you have received access and are ready to start. Move this task to 'Done' when ready.",
                status: "OPEN",
                priority: "HIGH"
            },
            {
                projectId,
                assignedTo: payment.scientistId,
                title: "Project Onboarding",
                description: "Read through the project description and requirements to fully understand the scope.",
                status: "OPEN",
                priority: "MEDIUM"
            }
        ]
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

    await logActivity(payment.employerId, "PAYMENT_VERIFIED", "SUCCESS", `Payment verified for project ${projectId}`, { reference });
    
    // Update Transaction Status
    const transaction = await prisma.transaction.findFirst({
        where: { reference: reference }
    });

    if (transaction) {
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "SUCCESS" }
        });
    }

    return { success: true, message: "Payment verified successfully", projectId };

  } catch (error) {
    console.error("Verify payment error:", error);
    return { success: false, message: "Internal server error during verification" };
  }
}

export async function getPayouts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const payouts = await prisma.payment.findMany({
      where: {
        status: { in: ["RELEASED", "COMPLETED"] },
      },
      include: {
        project: {
          select: { title: true },
        },
        scientist: {
          select: {
            fullName: true,
            email: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            recipientCode: true,
          },
        },
      },
      orderBy: [
        { status: "desc" }, // RELEASED (R) comes after COMPLETED (C)? No.
        // We want RELEASED first.
        // Alphabetical: COMPLETED, FUNDED, PENDING, RELEASED.
        // So 'desc' puts RELEASED before COMPLETED. Correct.
        { updatedAt: "desc" },
      ],
    });

    return { success: true, data: payouts };
  } catch (error) {
    console.error("Get payouts error:", error);
    return { error: "Failed to fetch payouts" };
  }
}

export async function getPaystackBalance() {
    if (!PAYSTACK_SECRET_KEY) return 0;
    try {
        const response = await fetch("https://api.paystack.co/balance", {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        });
        const data = await response.json();
        if (data.status && data.data.length > 0) {
            // Paystack returns an array of balances (one per currency).
            // We assume NGN or the first one.
            const ngnBalance = data.data.find((b: any) => b.currency === "NGN") || data.data[0];
            return ngnBalance.balance / 100; // Convert kobo to main unit
        }
        return 0;
    } catch (error) {
        console.error("Error fetching Paystack balance:", error);
        return 0;
    }
}

export async function getPayoutStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile || profile.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const [pending, completed, paystackBalance] = await Promise.all([
            prisma.payment.aggregate({
                where: { status: "RELEASED" },
                _sum: { scientistAmount: true },
                _count: true
            }),
            prisma.payment.aggregate({
                where: { status: "COMPLETED" },
                _sum: { scientistAmount: true },
                _count: true
            }),
            getPaystackBalance()
        ]);

        return {
            success: true,
            data: {
                pendingCount: pending._count,
                pendingAmount: Number(pending._sum.scientistAmount || 0),
                completedCount: completed._count,
                completedAmount: Number(completed._sum.scientistAmount || 0),
                paystackBalance: paystackBalance
            }
        };
    } catch (error) {
        console.error("Get payout stats error:", error);
        return { error: "Failed to fetch stats" };
    }
}

export async function processPayout(paymentId: string, method: "AUTO" | "MANUAL") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { scientist: true, project: true }
    });

    if (!payment) return { error: "Payment not found" };
    if (payment.status !== "RELEASED") return { error: "Payment is not pending release" };

    let transactionRef = `PAYOUT-${Date.now()}`;

    if (method === "AUTO") {
        if (!PAYSTACK_SECRET_KEY) return { error: "Paystack key missing" };
        if (!payment.scientist.recipientCode) {
            // Try to create recipient code if missing but bank details exist
             if (payment.scientist.bankName && payment.scientist.accountNumber && payment.scientist.accountName) {
                // We need bank code. Assuming we stored it or can fetch it? 
                // Currently we don't store bankCode in Profile, just bankName.
                // This is a limitation. We should have stored bankCode.
                // For now, fail if no recipientCode.
                return { error: "Scientist has no recipient code. Use Manual Payout." };
             }
             return { error: "Scientist bank details incomplete. Use Manual Payout." };
        }

        // Initiate Transfer
        const response = await fetch("https://api.paystack.co/transfer", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                source: "balance",
                amount: Math.round(payment.scientistAmount.toNumber() * 100),
                recipient: payment.scientist.recipientCode,
                reason: `Payout for ${payment.project.title}`,
                reference: transactionRef
            }),
        });

        const data = await response.json();
        if (!data.status) {
            return { error: data.message || "Transfer failed" };
        }
        // If queued or success, proceed.
    }

    // Update Payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
      },
    });

    // Update or Create Transaction
    // Check if a pending transaction exists for this payment
    // We can't easily query inside JSON metadata efficiently without raw query, 
    // but we can search by userId and type and status PENDING.
    const pendingTx = await prisma.transaction.findFirst({
        where: {
            userId: payment.scientistId,
            type: "PAYOUT",
            status: "PENDING",
            // Ideally we check metadata, but for now let's just create a new one if not found or update latest.
            // Or just create a SUCCESS one and mark old PENDING as FAILED/CANCELLED?
            // Better: Just create a new SUCCESS transaction. The PENDING one serves as a "Request".
            // Actually, let's try to update if we can find it.
        },
        orderBy: { createdAt: 'desc' }
    });

    if (pendingTx) {
        await prisma.transaction.update({
            where: { id: pendingTx.id },
            data: {
                status: "SUCCESS",
                reference: transactionRef,
                description: `Payout processed (${method}) for project: ${payment.project.title}`
            }
        });
    } else {
        await prisma.transaction.create({
            data: {
                userId: payment.scientistId,
                type: "PAYOUT",
                amount: payment.scientistAmount,
                status: "SUCCESS",
                reference: transactionRef,
                description: `Payout processed (${method}) for project: ${payment.project.title}`,
                metadata: { projectId: payment.projectId, paymentId: payment.id }
            }
        });
    }

    await createNotification(
      payment.scientistId,
      "PAYMENT_SUCCESS",
      `Your payout for "${payment.project.title}" has been processed via ${method === "AUTO" ? "Bank Transfer" : "Manual Transfer"}.`,
      "Payout Processed",
      "/scientist/wallet"
    );

    await logActivity(profile.id, "PROCESS_PAYOUT", "SUCCESS", `Processed payout for payment ${paymentId} (${method})`);
    
    revalidatePath("/admin/payroll");
    return { success: true };
  } catch (error) {
    console.error("Process payout error:", error);
    return { error: "Failed to process payout" };
  }
}
