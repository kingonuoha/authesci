"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/services/auth-service";

export async function updateSettings(settings: any) {
  try {
    const { user } = await getAuthenticatedUser();

    // Fetch existing profile to merge settings
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { settings: true },
    });

    const currentSettings = (profile?.settings as any) || {};

    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };

    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        settings: updatedSettings,
      },
    });

    revalidatePath("/settings");
    return { status: "success", message: "Settings updated successfully" };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { status: "error", message: "Failed to update settings" };
  }
}

export async function changePassword(formData: FormData) {
    // This would typically involve calling the Supabase Auth API
    // Since we are using Supabase directly in client mostly for auth, 
    // server-side password change might require using the supabase admin client or service role 
    // if the user doesn't provide the old password to re-authenticate.
    // However, Supabase updateUser() allows password change.
    
    // For this MVP, we will return a message instructing the user to use the 'Forgot Password' flow 
    // or implement client-side Supabase password update which is safer for handling sensitive data.
    return { status: "info", message: "Please use the 'Forgot Password' or client-side flow for password changes." };
}
