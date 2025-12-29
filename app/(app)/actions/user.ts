"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        email: true
      }
    });

    return profile;
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }
}
