import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { JobCard } from "@/components/modules/jobs/JobCard";
import { JobFilter } from "@/components/modules/jobs/JobFilter";
import { JobStatus, JobType, Prisma } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { rankJobs, isAIEnabled, isAiFreeAccess } from "@/lib/ai/service";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const jobType = typeof resolvedSearchParams.jobType === 'string' ? resolvedSearchParams.jobType : undefined;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const where: Prisma.JobWhereInput = {
    status: JobStatus.ACTIVE,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category && category !== 'all') {
    where.category = category;
  }

  if (jobType && jobType !== 'all' && Object.values(JobType).includes(jobType as JobType)) {
    where.jobType = jobType as JobType;
  }

  let jobs = await prisma.job.findMany({
    where,
    include: {
      employer: true,
    },
    orderBy: {
      createdAt: sort === 'oldest' ? 'asc' : 'desc',
    },
  });

  if (user && isAIEnabled()) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    const isFree = isAiFreeAccess();

    if (profile && (isFree || profile.isPremium)) {
      // Rank jobs using AI
      // We cast jobs to any because rankJobs expects a simplified object but returns the full object with extra fields
      jobs = await rankJobs(profile, jobs) as any;

      // If sorting by "newest" (default), we might want to keep AI ranking as primary sort?
      // But user explicitly asked for filtering/sorting. 
      // If user selected a sort, we should probably respect it.
      // If sort is default 'newest', maybe we can prioritize AI matches?
      // For now, let's just let rankJobs do its thing which sorts by match score descending.
      // BUT, rankJobs sorts by match score. If user wants "Oldest", we should re-sort?
      // Let's stick to rankJobs sorting if AI is active, unless user explicitly picked a sort other than default?
      // Actually, rankJobs returns sorted array.

      if (sort === 'oldest') {
        jobs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      } else if (sort === 'newest' && !search && !category && !jobType) {
        // If default view, keep AI ranking
      } else if (sort === 'newest') {
        // If user explicitly filtered, maybe they still want AI ranking? 
        // Let's keep AI ranking as it's "smart".
      }
    }
  }

  return (
    <div className="container py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Board</h1>
        <p className="text-muted-foreground">Find your next opportunity in science and research.</p>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <JobFilter />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={{
                ...job,
                finalPrice: job.finalPrice ? Number(job.finalPrice) : null,
              } as any}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No active jobs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
