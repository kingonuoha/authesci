"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/mail";
import cloudinary from "@/lib/cloudinary";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Generate a random 6-digit code
function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { role: true, email: true, id: true }
    });

    if (profile?.role === Role.ADMIN) return { ...profile, user };
    return null;
}

export type ResetMode = "standard" | "nuclear";

export async function initiateFactoryReset(password: string, mode: ResetMode = "standard") {
    const admin = await verifyAdmin();
    if (!admin || !admin.email) return { success: false, error: "Unauthorized" };

    const identifier = `FACTORY_RESET_${admin.email}`;

    // 1. Rate Limiting
    const existingToken = await prisma.verificationToken.findFirst({
        where: {
            identifier,
            expires: { gt: new Date() }
        },
        orderBy: { expires: 'desc' }
    });

    if (existingToken) {
        const createdAt = new Date(existingToken.expires.getTime() - 15 * 60 * 1000);
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        
        if (createdAt > twoMinutesAgo) {
            return { success: false, error: "Please wait a moment before requesting another code." };
        }
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.verificationToken.deleteMany({
        where: { identifier }
    });

    await prisma.verificationToken.create({
        data: {
            identifier,
            token: code,
            expires
        }
    });

    const modeLabel = mode === "nuclear" ? "☢️ NUCLEAR EVENT ☢️" : "Factory Reset";

    try {
        await sendEmail({
            to: admin.email,
            subject: `${modeLabel} Verification Code`,
            html: `
                <h1>${modeLabel} Verification</h1>
                <p>You have initiated a <strong>${mode.toUpperCase()}</strong> reset of the system.</p>
                ${mode === "nuclear" ? "<p style='color: red; font-weight: bold;'>WARNING: This will delete ABSOLUTELY EVERYTHING. FAQs, Logs, Analytics, Subscriptions. Only your admin account will remain.</p>" : "<p>This will delete all user data, jobs, and applications.</p>"}
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>This code expires in 15 minutes.</p>
            `,
            text: `Your ${mode} reset code is: ${code}`
        });
        console.log(`[RESET] Code sent to ${admin.email} (Mode: ${mode})`);
    } catch (err) {
        console.error("Failed to send email:", err);
        return { success: false, error: "Failed to send verification email" };
    }

    return { success: true, message: `Verification code sent to email for ${mode} reset` };
}

export async function confirmFactoryReset(code: string, confirmationText: string, mode: ResetMode = "standard") {
    const requiredText = mode === "nuclear" ? "nuke everything" : "reset authesci";
    
    if (confirmationText !== requiredText) {
        return { success: false, error: `Incorrect confirmation text. Type "${requiredText}"` };
    }

    const admin = await verifyAdmin();
    if (!admin) return { success: false, error: "Unauthorized" };

    const identifier = `FACTORY_RESET_${admin.email}`;
    
    const tokenRecord = await prisma.verificationToken.findFirst({
        where: {
            identifier,
            token: code,
            expires: { gt: new Date() }
        }
    });

    if (!tokenRecord) {
        return { success: false, error: "Invalid or expired code" };
    }

    try {
        console.log(`[RESET] ${mode.toUpperCase()} started by ${admin.email}`);

        // 1. Collect Data Needed Before Deletion
        const allAdmins = await prisma.profile.findMany({
            where: { role: Role.ADMIN },
            select: { email: true }
        });
        const adminEmails = allAdmins.map(a => a.email).filter((email): email is string => !!email);

        const profilesToDelete = await prisma.profile.findMany({
            where: { id: { not: admin.id } },
            select: { userId: true }
        });
        const userIdsToDelete = profilesToDelete.map(p => p.userId).filter(Boolean);


        // 2. Cloudinary Wipe
        try {
            console.log("[RESET] Wiping Cloudinary assets...");
            await Promise.allSettled([
                cloudinary.api.delete_all_resources({ resource_type: 'image' }),
                cloudinary.api.delete_all_resources({ resource_type: 'video' }),
                cloudinary.api.delete_all_resources({ resource_type: 'raw' })
            ]);
        } catch (cloudError) {
            console.error("[RESET] Cloudinary wipe warning:", cloudError);
        }


        // 3. Database Wipe
        const deleteOperations = [
            // Standard User Data
            prisma.verificationToken.deleteMany(),
            prisma.job.deleteMany(),
            prisma.application.deleteMany(),
            prisma.projectFile.deleteMany(),
            prisma.task.deleteMany(),
            prisma.project.deleteMany(),
            prisma.message.deleteMany(),
            prisma.notification.deleteMany(),
            // Conversations often left empty, let's clean them in both modes to be safe
            prisma.conversation.deleteMany(), 
            // Update Admin Storage to 0 since we wiped their files (if any existed)
            prisma.profile.update({
                where: { id: admin.id },
                data: { storageUsed: 0 }
            })
        ];

        if (mode === "nuclear") {
            // THE NUKE: Delete "Platform Assets" too
            console.log("[RESET] NUCLEAR MODE: Adding FAQs, Logs, PageViews, Subscriptions to deletion queue.");
            deleteOperations.push(
                prisma.fAQ.deleteMany(),
                prisma.pageView.deleteMany(),
                prisma.log.deleteMany(),
                prisma.subscription.deleteMany(),
                prisma.transaction.deleteMany() // Explicitly clear any remaining orphaned transactions
            );
        }

        // Finally delete profiles except admin
        deleteOperations.push(
            prisma.profile.deleteMany({
                where: { id: { not: admin.id } }
            })
        );

        try {
            await prisma.$transaction(deleteOperations);
            console.log(`[RESET] Database wiped successfully (Mode: ${mode})`);
        } catch (dbError) {
            console.error("[RESET] Database transaction failed:", dbError);
            return { success: false, error: "Database reset failed. No data was deleted." };
        }


        // 4. Supabase Auth Wipe
        console.log(`[RESET] Deleting ${userIdsToDelete.length} users from Supabase Auth...`);
        const authDeletePromises = userIdsToDelete.map(uid => 
            supabaseAdmin.auth.admin.deleteUser(uid)
        );
        await Promise.allSettled(authDeletePromises);


        // 5. Notify
        for (const email of adminEmails) {
            try {
                await sendEmail({
                    to: email,
                    subject: `System ${mode === "nuclear" ? "NUCLEAR RESET" : "Factory Reset"} Notification`,
                    html: `
                        <h1>System Reset Complete</h1>
                        <p>The Authesci system has undergone a <strong>${mode.toUpperCase()}</strong> reset by Administrator <strong>${admin.email}</strong>.</p>
                        <p>All user data has been wiped.</p>
                        ${mode === "nuclear" ? "<p>This was a NUCLEAR reset. Analytics, FAQs, and subscriptions were also destroyed.</p>" : ""}
                    `,
                    text: `The Authesci system has been reset (${mode}) by ${admin.email}.`
                });
            } catch (err) {
                console.error(`Failed to notify admin ${email}:`, err);
            }
        }

        revalidatePath("/");
        
        return { success: true, message: `${mode === "nuclear" ? "Nuclear event" : "Factory reset"} complete. System wiped.` };

    } catch (error) {
        console.error("Reset Error:", error);
        return { success: false, error: "Failed to perform reset" };
    }
}
