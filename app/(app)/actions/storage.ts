"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const MAX_STORAGE_BYTES = 1.5 * 1024 * 1024 * 1024; // 1.5 GB

export type StorageCheckState = {
  hasCapacity: boolean;
  storageUsed: number;
  storageCapacity: number;
  message: string;
};

/**
 * Checks if the user has enough storage capacity for a new file.
 * @param newFileSize The size of the new file in bytes.
 * @returns An object indicating storage status.
 */
export async function checkStorageCapacity(newFileSize: number): Promise<StorageCheckState> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        hasCapacity: false,
        storageUsed: 0,
        storageCapacity: MAX_STORAGE_BYTES,
        message: "User not authenticated.",
      };
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { storageUsed: true },
    });

    if (!profile) {
      return {
        hasCapacity: false,
        storageUsed: 0,
        storageCapacity: MAX_STORAGE_BYTES,
        message: "User profile not found.",
      };
    }

    const currentUsage = Number(profile.storageUsed || 0);
    
    if (currentUsage + newFileSize > MAX_STORAGE_BYTES) {
      return {
        hasCapacity: false,
        storageUsed: currentUsage,
        storageCapacity: MAX_STORAGE_BYTES,
        message: "Insufficient storage space. Please upgrade your plan.",
      };
    }

    return {
      hasCapacity: true,
      storageUsed: currentUsage,
      storageCapacity: MAX_STORAGE_BYTES,
      message: "Sufficient storage available.",
    };
  } catch (error) {
    console.error("Error checking storage capacity:", error);
    return {
      hasCapacity: false,
      storageUsed: 0,
      storageCapacity: MAX_STORAGE_BYTES,
      message: "An error occurred while checking storage capacity.",
    };
  }
}

/**
 * Updates the user's total storage usage.
 * @param fileSize The size of the file to add to the total, in bytes.
 * @returns An object indicating success or failure.
 */
export async function updateStorageUsage(fileSize: number): Promise<{ success: boolean; message: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, message: "User not authenticated." };
        }

        await prisma.profile.update({
            where: { userId: user.id },
            data: {
                storageUsed: {
                    increment: fileSize,
                },
            },
        });

        return { success: true, message: "Storage usage updated successfully." };

    } catch (error) {
        console.error("Error updating storage usage:", error);
        return { success: false, message: "An error occurred while updating storage usage." };
    }
}
