"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client"; // Import Role enum

// Helper function to get the authenticated user and check role
async function getAuthenticatedAdminProfile() {
  // This is a placeholder. In reality, you'd get the session from Supabase
  // and then fetch the profile from Prisma based on session.user.id
  // For now, let's mock an admin user
  const profile = { id: 'mock-admin-id', userId: 'mock-admin-user-id', role: Role.ADMIN, email: 'admin@example.com', fullName: 'Mock Admin', createdAt: new Date(), updatedAt: new Date() };

  if (!profile || profile.role !== Role.ADMIN) {
    redirect('/login'); // Redirect to login if not authenticated or not an admin
  }
  return profile;
}

export async function getAdminDashboardMetrics() {
  await getAuthenticatedAdminProfile(); // Ensure only admins can access this data

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7); // 7 days ago

  // --- Stat Cards ---
  const totalUsers = await prisma.profile.count();
  const activeJobs = await prisma.job.count({
    where: { status: "ACTIVE" },
  });
  const totalRevenueResult = await prisma.payment.aggregate({
    _sum: {
      platformFee: true,
    },
    where: {
      status: { in: ["RELEASED", "COMPLETED"] }, // Count fees from released (pending payout) and completed (paid out) payments
    },
  });
  const totalRevenue = totalRevenueResult._sum.platformFee || 0;

  const pendingPayoutsResult = await prisma.payment.aggregate({
    _sum: {
      scientistAmount: true,
    },
    where: {
      status: "FUNDED", // Payments held in escrow, waiting for release/payout
    },
  });
  const pendingPayouts = pendingPayoutsResult._sum.scientistAmount || 0;

  const totalViewsToday = await prisma.pageView.count({
    where: {
      timestamp: {
        gte: today,
      },
    },
  });

  // --- User Role Distribution (Donut Chart Data) ---
  const userRoles = await prisma.profile.groupBy({
    by: ["role"],
    _count: {
      id: true,
    },
  });
  const userRoleDistribution = userRoles.map((item) => ({
    name: item.role,
    value: item._count.id,
  }));

  // --- Recently Joined Users (Table Data) ---
  const recentlyJoinedUsers = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // --- System Success vs. Error Rate (from Log model) ---
  const systemLogsByStatus = await prisma.log.groupBy({
    by: ["level"],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: sevenDaysAgo, // Last 7 days
      },
    },
  });
  const systemHealth = {
    totalLogs: systemLogsByStatus.reduce((acc, curr) => acc + curr._count.id, 0),
    info: systemLogsByStatus.find((log) => log.level === "INFO")?._count.id || 0,
    warn: systemLogsByStatus.find((log) => log.level === "WARN")?._count.id || 0,
    error: systemLogsByStatus.find((log) => log.level === "ERROR")?._count.id || 0,
  };
  // Calculate a "success rate" based on (INFO + WARN) / total, or simply show error count
  const errorRate = systemHealth.totalLogs > 0 ? (systemHealth.error / systemHealth.totalLogs) * 100 : 0;


  // --- Views Rate (over the last 7 days) ---
  // Aggregate page views per day
  const pageViewsLast7Days = await prisma.$queryRaw<
    { date: Date; count: number }[]
  >`
    SELECT
        DATE_TRUNC('day', timestamp) AS date,
        COUNT(id)::int AS count
    FROM
        "page_views"
    WHERE
        timestamp >= ${sevenDaysAgo}
    GROUP BY
        DATE_TRUNC('day', timestamp)
    ORDER BY
        date ASC;
  `;
  // Fill in missing days with 0 for a continuous chart
  const viewsData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + i);
    date.setHours(0,0,0,0);
    const found = pageViewsLast7Days.find(
      (pv) => pv.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
    return { date: date.toISOString().split('T')[0], count: found ? found.count : 0 };
  });


  // --- Device Ratio ---
  const deviceDistribution = await prisma.pageView.groupBy({
    by: ["deviceType"],
    _count: {
      id: true,
    },
    where: {
        timestamp: {
            gte: sevenDaysAgo // Consider recent views for distribution
        }
    }
  });
  const totalRecentViews = deviceDistribution.reduce((acc, curr) => acc + curr._count.id, 0);
  const deviceRatio = deviceDistribution.map(item => ({
    name: item.deviceType,
    value: item._count.id,
    percentage: totalRecentViews > 0 ? (item._count.id / totalRecentViews) * 100 : 0
  }));


  // --- Platform Overview Data ---
  const totalJobs = await prisma.job.count();
  const scientistCount = await prisma.profile.count({ where: { role: "SCIENTIST" } });
  const totalProjects = await prisma.project.count();
  const activeProjects = await prisma.project.count({ where: { status: "ACTIVE" } });

  // --- Storage Analytics ---
  const MAX_STORAGE_PER_USER = 1.5 * 1024 * 1024 * 1024;
  const totalStorageUsedResult = await prisma.profile.aggregate({
    _sum: {
      storageUsed: true,
    },
  });
  const totalStorageUsed = Number(totalStorageUsedResult._sum.storageUsed || 0);
  const totalStorageCapacity = totalUsers * MAX_STORAGE_PER_USER;

  const topUsersByStorage = await prisma.profile.findMany({
    orderBy: {
      storageUsed: 'desc',
    },
    take: 5,
    select: {
      id: true,
      fullName: true,
      email: true,
      storageUsed: true,
    },
  });


  return {
    statCards: {
      totalUsers,
      activeJobs,
      totalRevenue: typeof totalRevenue === 'number' ? totalRevenue : totalRevenue.toNumber(),
      pendingPayouts: typeof pendingPayouts === 'number' ? pendingPayouts : pendingPayouts.toNumber(),
      totalViewsToday,
    },
    userRoleDistribution,
    recentlyJoinedUsers,
    systemHealth: {
      ...systemHealth,
      errorRate,
    },
    pageViewsLast7Days: viewsData,
    deviceRatio,
    platformOverview: {
      jobs: { total: totalJobs, active: activeJobs },
      scientists: { total: totalUsers, count: scientistCount },
      projects: { total: totalProjects, active: activeProjects },
    },
    storageAnalytics: {
      totalStorageUsed,
      totalStorageCapacity,
      topUsersByStorage: topUsersByStorage.map(u => ({ ...u, storageUsed: Number(u.storageUsed || 0) })),
    }
  };
}

export async function banUserAction(userId: string) {
  await getAuthenticatedAdminProfile();

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { isBanned: true },
    });
    revalidatePath("/admin/users");
    return { status: "success", message: "User banned successfully" };
  } catch (error) {
    console.error("Error banning user:", error);
    return { status: "error", message: "Failed to ban user" };
  }
}

export async function unbanUserAction(userId: string) {
  await getAuthenticatedAdminProfile();

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { isBanned: false },
    });
    revalidatePath("/admin/users");
    return { status: "success", message: "User unbanned successfully" };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { status: "error", message: "Failed to unban user" };
  }
}

export async function deleteJobAction(jobId: string) {
  await getAuthenticatedAdminProfile();

  try {
    await prisma.job.delete({
      where: { id: jobId },
    });
    revalidatePath("/admin/jobs");
    return { status: "success", message: "Job deleted successfully" };
  } catch (error) {
    console.error("Error deleting job:", error);
    return { status: "error", message: "Failed to delete job" };
  }
}

export async function promoteUserToAdminAction(userId: string) {
  await getAuthenticatedAdminProfile();

  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { role: Role.ADMIN },
    });
    revalidatePath("/admin/users");
    return { status: "success", message: "User promoted to Admin successfully" };
  } catch (error) {
    console.error("Error promoting user:", error);
    return { status: "error", message: "Failed to promote user" };
  }
}

// ... existing imports ...

export async function getAnalyticsChartData(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  await getAuthenticatedAdminProfile();

  const now = new Date();
  let startDate = new Date();
  let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0); // Start of today
      dateFormat = { hour: 'numeric', hour12: true };
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      dateFormat = { month: 'short', year: 'numeric' };
      break;
  }

  const views = await prisma.pageView.findMany({
    where: {
      timestamp: {
        gte: startDate,
      },
    },
    select: {
      timestamp: true,
      deviceType: true,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  // Group by date/time
  const groupedData = new Map<string, { total: number; desktop: number; mobile: number; tablet: number }>();

  views.forEach((view) => {
    let key = '';
    if (period === 'day') {
       key = view.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    } else if (period === 'year') {
       key = view.timestamp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
       key = view.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, { total: 0, desktop: 0, mobile: 0, tablet: 0 });
    }

    const entry = groupedData.get(key)!;
    entry.total++;
    if (view.deviceType === 'DESKTOP') entry.desktop++;
    else if (view.deviceType === 'MOBILE') entry.mobile++;
    else if (view.deviceType === 'TABLET') entry.tablet++;
  });

  // Fill in missing gaps if needed (simplified for now to just return existing data points)
  // For a proper chart, we might want to fill zero-value dates, but let's start with this.

  return Array.from(groupedData.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}

export async function getAnalyticsLogs({
  page = 1,
  limit = 20,
  search = "",
  deviceType = "ALL",
}: {
  page?: number;
  limit?: number;
  search?: string;
  deviceType?: string;
}) {
  await getAuthenticatedAdminProfile();

  const skip = (page - 1) * limit;

  const where: Prisma.PageViewWhereInput = {
    OR: search
      ? [
          { path: { contains: search, mode: "insensitive" } },
          { ipAddress: { contains: search, mode: "insensitive" } },
          {
            user: {
              fullName: { contains: search, mode: "insensitive" },
            },
          },
          {
            user: {
              email: { contains: search, mode: "insensitive" },
            },
          },
        ]
      : undefined,
    deviceType:
      deviceType && deviceType !== "ALL"
        ? (deviceType as any)
        : undefined,
  };

  const [data, total] = await Promise.all([
    prisma.pageView.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
    }),
    prisma.pageView.count({ where }),
  ]);

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}