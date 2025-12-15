"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function deleteUserAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    // Delete profile
    await prisma.profile.delete({
      where: { userId: user.id },
    });
    
    // Sign out
    await supabase.auth.signOut();
    return { success: true };
  } catch (e) {
    console.error("Delete account error:", e);
    return { error: "Failed to delete account" };
  }
}
