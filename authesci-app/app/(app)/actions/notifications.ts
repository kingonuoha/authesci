'use server'

import { getUserNotifications, markNotificationRead, markAllRead, getUnreadCount, deleteNotification, clearAllNotifications } from "@/lib/notifications/service";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

async function getProfileId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });
  
  return profile?.id;
}

export async function getProfileIdAction() {
  return await getProfileId();
}

export async function getUserRoleAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { role: true }
  });
  
  return profile?.role;
}

export async function getNotificationsAction(limit?: number) {
  const profileId = await getProfileId();
  if (!profileId) return [];
  return await getUserNotifications(profileId, limit);
}

export async function getUnreadCountAction() {
  const profileId = await getProfileId();
  if (!profileId) return 0;
  return await getUnreadCount(profileId);
}

export async function markReadAction(notificationId: string) {
  await markNotificationRead(notificationId);
  revalidatePath('/');
}

export async function markAllReadAction() {
  const profileId = await getProfileId();
  if (!profileId) return;
  await markAllRead(profileId);
  revalidatePath('/');
}
export async function deleteNotificationAction(notificationId: string) {
  await deleteNotification(notificationId);
  revalidatePath('/');
}

export async function clearAllNotificationsAction() {
  const profileId = await getProfileId();
  if (!profileId) return;
  await clearAllNotifications(profileId);
  revalidatePath('/');
}
