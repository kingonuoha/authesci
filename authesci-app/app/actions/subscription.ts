"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function subscribeToWaitlist(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please provide a valid email address." };
  }

  try {
    await prisma.subscription.upsert({
      where: { email },
      update: { source: "IN_LAB_WAITLIST" },
      create: {
        email,
        source: "IN_LAB_WAITLIST",
      },
    });

    return { success: "You have been added to the waitlist!" };
  } catch (error) {
    console.error("Waitlist subscription error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
