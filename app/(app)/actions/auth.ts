"use server";

import { logActivity } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { getPasswordChangedEmail } from "@/lib/email/templates";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/service";

const signUpSchema = z.object({
  email: z.string().email(),
  password:
    z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .regex(/.*[A-Z].*/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/.*[a-z].*/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/.*[0-9].*/, {
        message: "Password must contain at least one number",
      })
      .regex(/.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*/, {
        message: "Password must contain at least one special character",
      }),
  fullName: z.string().min(2),
  role: z.enum([Role.SCIENTIST, Role.EMPLOYER]),
  institution: z.string().optional(),
});

export interface ActionResult {
  status: "success" | "error";
  message: string;
  error: any;
  formData?: {
    email?: string;
    fullName?: string;
    institution?: string;
  };
}

export async function signUp(
  previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as Role;
  const institution = formData.get("institution") as string;

  const validatedFields = signUpSchema.safeParse({
    email,
    password,
    fullName,
    role,
    institution,
  });

  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return {
      status: "error",
      message: "Validation Failed",
      error: validatedFields.error.issues,
      formData: { email, fullName, institution },
    };
  }

  const supabase = await createClient();

  // Construct options object safely to avoid TypeScript errors
  const signUpOptions: {
    emailRedirectTo?: string;
    data?: {
      full_name?: string;
    };
  } = {
    emailRedirectTo: `${origin}/auth/callback`,
  };

  if (fullName) {
    signUpOptions.data = { full_name: fullName };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: signUpOptions,
  });

  if (error) {
    console.error(error);
    return {
      status: "error",
      message: "Authentication Failed",
      error: error.message,
      formData: { email, fullName, institution },
    };
  }

  const user = data.user;

  if (!user) {
    return {
      status: "error",
      message: "User Not Found",
      error: "Could not retrieve user information after signup.",
    };
  }

  // Set the user's role in app_metadata
  const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { app_metadata: { role: role } }
  );

  if (adminError) {
    console.error("Failed to set user role:", adminError);
    // Clean up the created user if role update fails
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return {
      status: "error",
      message: "User Initialization Failed",
      error: "Could not set user role during signup.",
      formData: { email, fullName, institution },
    };
  }

  try {
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        email,
        fullName,
        role,
        institution,
      },
    });

    // Notify user about successful signup
    await createNotification(
        profile.id,
        "SYSTEM_ALERT",
        "Welcome to Authesci! Please verify your email to get started.",
        "Welcome!",
        "/dashboard"
    );

    await logActivity(profile.id, "SIGNUP", "SUCCESS", "User registered successfully");
  } catch (e: any) {
    console.error(e);
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return {
      status: "error",
      message: "Profile Creation Failed",
      error: e.message,
      formData: { email, fullName, institution },
    };
  }

  return {
    status: "success",
    message: "Signup Successful!",
    error: "Please check your email for a verification link.",
  };
}

export async function login(
  previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message === "Email not confirmed") {
      return {
        status: "error",
        message: "Email Not Verified",
        error: [
          {
            path: ["email"],
            message: "Please check your email to verify your account.",
          },
        ],
        formData: { email },
      };
    }
    return {
      status: "error",
      message: "Login Failed",
      error: [
        {
          path: ["password"],
          message: "Invalid credentials. Please try again.",
        },
      ],
      formData: { email },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "User Not Found",
      error: "Could not retrieve user information.",
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return {
      status: "error",
      message: "Profile Not Found",
      error: "User profile not found. Please contact support.",
    };
  }

  if (profile.isBanned) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "Account Suspended",
      error: "Your account has been suspended. Please contact support.",
    };
  }

  // Backfill app_metadata for existing users
  if (!user.app_metadata.role) {
    const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { app_metadata: { role: profile.role } }
    );
    if (adminError) {
      // Log the error but don't block the login
      console.error("Failed to backfill user role:", adminError);
    }
  }

  await logActivity(profile.id, "LOGIN", "SUCCESS", "User logged in");

  // Redirect directly to dashboard based on role
  // Redirect directly to dashboard based on role
  // We return the URL so the client can show a toast before redirecting
  const redirectUrl = profile.role ? `/${profile.role.toLowerCase()}/dashboard` : "/dashboard";
  
  return {
    status: "success",
    message: "Successfully logged in, redirecting...",
    error: null,
    formData: { email, redirectUrl } as any // Adding redirectUrl to formData as a hack transport or better, update interface
  };
}

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  console.log("Received formData in requestPasswordReset:", formData);
  if (!(formData instanceof FormData)) {
    console.error("formData is not an instance of FormData:", formData);
    return {
      status: "error",
      message: "Invalid form submission",
      error: "Form data is not in the expected format.",
    };
  }
  const origin = (await headers()).get("origin");
  const email = formData.get("email") as string;
  const supabase = await createClient();

  // Check if a profile exists for the given email to prevent sending emails to unregistered users
  const existingProfile = await prisma.profile.findUnique({
    where: { email: email },
  });

  if (!existingProfile) {
    // Return a generic success message to prevent email enumeration attacks
    return {
      status: "success",
      message:
        "If an account with that email exists, a password reset link has been sent.",
      error: null,
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    console.error(error);
    return {
      status: "error",
      message: "Password Reset Failed",
      error: "Could not send password reset email. Please try again.",
    };
  }

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

export async function resetPassword(
  previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      return {
        status: "error",
        message: "Passwords do not match.",
        error: [{ path: ["confirmPassword"], message: "Passwords do not match." }],
      };
    }

    const supabase = await createClient();

    // 1. Update the password for the user in the recovery session
    const { data, error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("Password Update Failed:", updateError);
      return {
        status: "error",
        message: "Password reset failed.",
        error: "Could not update password. The link may have expired.",
      };
    }

    const user = data.user;

    // 2. Send confirmation email and log activity (if user object is available)
    if (user && user.email) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        const fullName = profile.fullName || "User";
        
        const html = getPasswordChangedEmail(fullName);
        await sendEmail({
          to: user.email,
          subject: "Your Authesci Password Has Been Changed",
          html,
        });

        await logActivity(profile.id, "PASSWORD_RESET", "SUCCESS", "Password reset successfully");
      }
    }

    // 3. Sign the user out
    await supabase.auth.signOut();
  } catch (e: any) {
    console.error("Unhandled error in resetPassword:", e);
    return {
      status: "error",
      message: "An unexpected error occurred during password reset.",
      error: e.message || "Unknown error",
    };
  }

  // 4. Redirect to login page
  redirect("/login?reset_success=true");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(error);
    return {
      status: "error",
      message: "Logout Failed",
      error: "Could not log out. Please try again.",
    };
  }

  redirect("/login");
}

import { getProfileId as getProfileIdUtils } from "@/lib/auth-utils";

export async function getProfileId() {
  return await getProfileIdUtils();
}

