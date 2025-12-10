import { MetadataRoute } from "next";
import { PrismaClient, JobStatus } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: "https://authesci.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://authesci.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://authesci.com/contact",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://authesci.com/jobs",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://authesci.com/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://authesci.com/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Fetch all active jobs
  try {
    const jobs = await prisma.job.findMany({
      where: { status: JobStatus.ACTIVE },
      select: { id: true, createdAt: true },
    });

    const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `https://authesci.com/jobs/${job.id}`,
      lastModified: job.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...routes, ...jobRoutes];
  } catch (error) {
    console.error("Failed to generate sitemap for jobs:", error);
    return routes;
  }
}
