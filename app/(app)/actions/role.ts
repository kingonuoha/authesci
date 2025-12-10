"use server";

import { logActivity } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications/service";

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

export async function updateRole(newRole: Role): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "error",
      message: "User not authenticated.",
      error: userError?.message || "No authenticated user found.",
    };
  }

  // Validate if the newRole is a valid Role enum value
  if (!Object.values(Role).includes(newRole)) {
    return {
      status: "error",
      message: "Invalid role provided.",
      error: `Role '${newRole}' is not a valid role.`, 
    };
  }

  try {
    // Update role in Prisma profile
    await prisma.profile.update({
      where: { userId: user.id },
      data: { role: newRole },
    });

    // Update role in Supabase app_metadata
    const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { app_metadata: { role: newRole } }
    );

    if (adminError) {
      console.error("Failed to update user role in Supabase app_metadata:", adminError);
      return {
        status: "error",
        message: "Failed to update role in authentication system.",
        error: adminError.message,
      };
    }

    // Revalidate the current path to reflect the role change
    // This will trigger a re-render of server components that depend on the user's role
    revalidatePath('/', 'layout'); // Revalidate all layouts and pages

    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
    
    if (profile) {
        await createNotification(
            profile.id,
            "SYSTEM_ALERT",
            `Your role has been updated to ${newRole}.`,
            "Role Updated",
            "/dashboard"
        );
    }

    await logActivity(user.id, "UPDATE_ROLE", "SUCCESS", `Role updated to ${newRole}`);

    return {
      status: "success",
      message: `Role updated to ${newRole}.`,
      error: null,
    };
  } catch (e: any) {
    console.error("Error updating role:", e);
    return {
      status: "error",
      message: "An unexpected error occurred while updating the role.",
      error: e.message,
    };
  }
}
