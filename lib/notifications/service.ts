import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

export type NotificationType = "APPLICATION_RECEIVED" | "NEW_APPLICANT" | "STATUS_UPDATE" | "JOB_RECOMMENDATION" | "SYSTEM";

export async function createNotification(
  userId: string, 
  type: NotificationType | string, 
  message: string, 
  title?: string, 
  link?: string, 
  metadata?: any,
  visualType?: 'image' | 'icon',
  visualResource?: string
) {
  try {
    const finalMetadata = {
      ...(metadata || {}),
      visual_type: visualType,
      visual_resource: visualResource
    };

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        title,
        link,
        metadata: finalMetadata,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function getUnreadCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: { 
        userId,
        read: false
      },
    });
  } catch (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
}

export async function markAllRead(userId: string) {
  try {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}
export async function deleteNotification(notificationId: string) {
  try {
    return await prisma.notification.delete({
      where: { id: notificationId },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

export async function clearAllNotifications(userId: string) {
  try {
    return await prisma.notification.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    throw error;
  }
}
