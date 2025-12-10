'use server'

import { generateCoverLetter, isAIEnabled, isAiFreeAccess } from "@/lib/ai/service";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function generateCoverLetterAction(jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }

  if (!isAIEnabled()) {
    return { error: "AI features are currently disabled" };
  }

  const [profile, job] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.job.findUnique({ where: { id: jobId } })
  ]);

  if (!profile || !job) {
    return { error: "Profile or Job not found" };
  }

  const isFree = isAiFreeAccess();

  if (!isFree && !profile.isPremium) {
    return { error: "Premium subscription required for AI features" };
  }

  try {
    const coverLetter = await generateCoverLetter(profile, job);
    return { success: true, coverLetter };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return { error: "Failed to generate cover letter" };
  }
}
