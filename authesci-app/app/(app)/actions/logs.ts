"use server";

import { prisma } from "@/lib/prisma";
import { getProfileId } from "@/lib/auth-utils";

export async function getLogsAction(limit: number = 50, userId?: string) {
  try {
    const currentUserId = await getProfileId();
    if (!currentUserId) throw new Error("Unauthorized");

    const currentUser = await prisma.profile.findUnique({ where: { id: currentUserId } });
    const isAdmin = currentUser?.role === "ADMIN";

    // If not admin, can only view own logs
    if (!isAdmin && userId && userId !== currentUserId) {
      throw new Error("Unauthorized");
    }
    
    // If not admin and no userId specified, default to own logs
    if (!isAdmin && !userId) {
        userId = currentUserId;
    }

    const where = userId ? { userId } : {};

    const logs = await prisma.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return logs;
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    return [];
  }
}
