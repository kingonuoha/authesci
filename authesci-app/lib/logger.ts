import { prisma } from "@/lib/prisma";

export type LogLevel = "INFO" | "WARN" | "ERROR";
export type LogStatus = "SUCCESS" | "FAILURE" | "WARNING";

export async function logActivity(
  userId: string,
  action: string,
  status: LogStatus,
  message: string,
  metadata?: Record<string, any>,
  level: LogLevel = "INFO"
) {
  try {
    await prisma.log.create({
      data: {
        userId,
        action,
        status,
        message,
        metadata: metadata || {},
        level,
      },
    });
  } catch (error) {
    console.error("Failed to create system log:", error);
    // Fail silently to not disrupt the main flow
  }
}
