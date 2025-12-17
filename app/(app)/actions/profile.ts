"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";
import { checkStorageCapacity, updateStorageUsage } from "./storage";

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
  education: z.object({
      degree: z.string().optional(),
      courseOfStudy: z.string().optional(),
      duration: z.string().optional(),
  }).optional(),
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

  // Check storage capacity before proceeding
  const storageCheck = await checkStorageCapacity(file.size);
  if (!storageCheck.hasCapacity) {
    return { error: storageCheck.message };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const resourceType = isPdf ? "raw" : "auto";

    const uploadPromise = new Promise<{ url?: string; error?: string }>((resolve) => {
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

    const uploadResult = await uploadPromise;

    if (uploadResult.url) {
      // If upload is successful, update storage usage
      const updateResult = await updateStorageUsage(file.size);
      if (!updateResult.success) {
        console.warn(`Failed to update storage usage: ${updateResult.message}`);
      }

      // FIX: Generate Signed URL for immediate access if it's a raw file (PDF) to prevent 401
      if (resourceType === "raw") {
         // The uploadResult.url is the unsigned one.
         // We can generate a signed one using the known public_id or filename
         // Cloudinary upload response usually contains public_id
         // But here uploadPromise resolves { url }. We should resolve more info.
      }
    }

    // Let's modify the uploadPromise to return public_id
    // Wait, I can't easily modify the promise return type without changing the signature above.
    // Instead, I'll just rely on the stored URL logic:
    // Actually, I should change the promise to return the whole result.
    
    // Quick Fix: If it's a raw file, we sign the URL using the URL we just got.
    if (uploadResult.url && resourceType === "raw") {
         const matches = uploadResult.url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
         if (matches && matches[1]) {
             const publicId = matches[1];
             const signedUrl = cloudinary.url(publicId, {
                 resource_type: "raw",
                 sign_url: true,
                 expires_at: Math.floor(Date.now() / 1000) + 3600
             });
             uploadResult.url = signedUrl;
         }
    }

    return uploadResult;

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



  // Manually construct education object from formData before validation if needed, or better:
  // Since 'education' is a nested object in our schema but comes as flat fields from the form:
  // We need to preprocess formData -> rawData structure.
  
  const rawData: any = {
    fullName: formData.get("fullName"),
    bio: formData.get("bio") || undefined,
    institution: formData.get("institution") || undefined,
    experience: formData.get("experience") || undefined,
    skills: formData.get("skills") || undefined,
    publications: formData.get("publications") || undefined,
    certifications: formData.get("certifications") || undefined,
    avatarUrl: formData.get("avatarUrl"),
    companyLogoUrl: formData.get("companyLogoUrl"),
    cvUrl: formData.get("cvUrl"),
  };

  const degree = formData.get("degree");
  const courseOfStudy = formData.get("courseOfStudy");
  const duration = formData.get("duration");

  if (degree || courseOfStudy || duration) {
      rawData.education = {
          degree: degree || "",
          courseOfStudy: courseOfStudy || "",
          duration: duration || ""
      };
  }

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

  const { fullName, bio, institution, experience, skills, publications, certifications, avatarUrl, companyLogoUrl, cvUrl, education } = validatedFields.data;

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
        avatarUrl: avatarUrl === "" ? null : (avatarUrl || undefined),
        companyLogoUrl: companyLogoUrl === "" ? null : (companyLogoUrl || undefined),
        cvUrl: cvUrl === "" ? null : (cvUrl || undefined),
        education: education || undefined, 
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

export async function updateLastSeen(): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { lastSeenAt: new Date() },
      });
    }
  } catch (error) {
    // It's a background task, so we don't want to throw errors that might
    // interrupt the user. We'll just log it for debugging.
    console.error("Failed to update last seen:", error);
  }
}
