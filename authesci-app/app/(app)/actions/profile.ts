"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().optional(),
  institution: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(), // JSON string or comma-separated
  publications: z.string().optional(), // JSON string or newline-separated
  certifications: z.string().optional(), // JSON string or newline-separated
  avatarUrl: z.string().optional(),
  companyLogoUrl: z.string().optional(),
  cvUrl: z.string().optional(),
});

export type ProfileState = {
  status: "success" | "error" | "idle";
  message: string;
  errors?: Record<string, string[]>;
};

export async function uploadFile(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string || "authesci/profiles";

  if (!file) {
    return { error: "No file provided" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const resourceType = isPdf ? "raw" : "auto";

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder, 
          resource_type: resourceType,
          access_mode: "public",
          use_filename: true,
          unique_filename: true,
          filename_override: file.name
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve({ error: "Upload failed" });
          } else {
            resolve({ url: result?.secure_url });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("File processing error:", error);
    return { error: "File processing failed" };
  }
}

export async function updateProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You must be logged in to update your profile.",
    };
  }

  const rawData = {
    fullName: formData.get("fullName"),
    bio: formData.get("bio") || undefined,
    institution: formData.get("institution") || undefined,
    experience: formData.get("experience") || undefined,
    skills: formData.get("skills") || undefined,
    publications: formData.get("publications") || undefined,
    certifications: formData.get("certifications") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    companyLogoUrl: formData.get("companyLogoUrl") || undefined,
    cvUrl: formData.get("cvUrl") || undefined,
  };

  const validatedFields = profileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    // Create a more descriptive message from the errors
    const errorMessages = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
      .join("; ");
      
    return {
      status: "error",
      message: `Validation failed: ${errorMessages}`,
      errors: errors,
    };
  }

  const { fullName, bio, institution, experience, skills, publications, certifications, avatarUrl, companyLogoUrl, cvUrl } = validatedFields.data;

  // Helper to parse arrays
  const parseArray = (input?: string) => {
    if (!input) return [];
    try {
      return JSON.parse(input);
    } catch {
      return input.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    }
  };

  const skillsArray = parseArray(skills);
  const publicationsArray = parseArray(publications);
  const certificationsArray = parseArray(certifications);

  try {
    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data: {
        fullName,
        bio,
        institution,
        experience,
        skills: skillsArray,
        publications: publicationsArray,
        certifications: certificationsArray,
        avatarUrl: avatarUrl || undefined, // Only update if provided
        companyLogoUrl: companyLogoUrl || undefined, // Only update if provided
        cvUrl: cvUrl || undefined, // Only update if provided
      },
    });

    // Calculate and update completion score
    const { percentage } = getProfileCompletion(updatedProfile);
    await prisma.profile.update({
      where: { userId: user.id },
      data: { completionScore: percentage },
    });

    // Generate and store embedding
    if (process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES) {
        try {
            const { generateEmbeddings } = await import("@/lib/ai/service");
            const textToEmbed = `${skillsArray.join(" ")} ${bio || ""} ${experience || ""}`;
            const embedding = await generateEmbeddings(textToEmbed);
            
            if (embedding) {
                await prisma.$executeRaw`
                    UPDATE profiles
                    SET "aiFeatureVector" = ${embedding}::vector
                    WHERE id = ${updatedProfile.id}
                `;
            }
        } catch (e) {
            console.error("Failed to generate/store profile embedding:", e);
        }
    }

    revalidatePath("/profile");
    revalidatePath("/scientist/profile");
    revalidatePath("/employer/profile");

    return {
      status: "success",
      message: "Profile updated successfully!",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      status: "error",
      message: "Failed to update profile. Please try again.",
    };
  }
}
