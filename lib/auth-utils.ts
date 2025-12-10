import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  return profile?.id || null;
}
