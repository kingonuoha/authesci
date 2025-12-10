import { PrismaClient, DeviceType } from "@prisma/client";

const prisma = new PrismaClient();

const PATHS = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/admin",
  "/admin/users",
  "/admin/jobs",
  "/jobs",
  "/jobs/1",
  "/profile",
  "/settings",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
];

const IPS = [
  "192.168.1.1",
  "10.0.0.1",
  "172.16.0.1",
  "203.0.113.1",
  "198.51.100.1",
];

const ACTIONS = [
  "LOGIN",
  "LOGOUT",
  "VIEW_JOB",
  "APPLY_JOB",
  "UPDATE_PROFILE",
  "VIEW_DASHBOARD",
];

async function main() {
  console.log("Starting analytics seed...");

  // Fetch existing users
  const profiles = await prisma.profile.findMany();
  const userIds = profiles.map((p) => p.id);

  if (userIds.length === 0) {
    console.log("No users found. Please seed users first.");
    return;
  }

  const pageViews = [];
  const logs = [];

  // Reference date: Dec 3rd, 2025
  const today = new Date("2025-12-03T12:00:00Z");

  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Random number of views per day (higher for recent days)
    const viewCount = Math.floor(Math.random() * 50) + 10 + (30 - i);

    for (let j = 0; j < viewCount; j++) {
      const viewDate = new Date(date);
      viewDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const userId = Math.random() > 0.3 ? userIds[Math.floor(Math.random() * userIds.length)] : null;
      const deviceType = Object.values(DeviceType)[Math.floor(Math.random() * Object.values(DeviceType).length)];

      pageViews.push({
        timestamp: viewDate,
        path: PATHS[Math.floor(Math.random() * PATHS.length)],
        userId: userId,
        ipAddress: IPS[Math.floor(Math.random() * IPS.length)],
        deviceType: deviceType,
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      });

      // Generate a log for some views
      if (userId && Math.random() > 0.7) {
        const isError = Math.random() > 0.9;
        const isWarn = Math.random() > 0.8;
        const level = isError ? "ERROR" : isWarn ? "WARN" : "INFO";
        const status = isError ? "FAILURE" : "SUCCESS";

        logs.push({
          userId: userId,
          action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
          status: status,
          level: level,
          message: isError ? "Something went wrong" : "Action completed successfully",
          createdAt: viewDate,
          metadata: { path: pageViews[pageViews.length - 1].path },
        });
      }
    }
  }

  console.log(`Generated ${pageViews.length} page views and ${logs.length} logs.`);

  // Batch insert (chunking to avoid limits if necessary, but 2000 records is fine)
  await prisma.pageView.createMany({ data: pageViews });
  await prisma.log.createMany({ data: logs });

  console.log("Analytics seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
