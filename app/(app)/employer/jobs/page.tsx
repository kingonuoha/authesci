import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { JobCard } from "@/components/modules/jobs/JobCard";
import { JobFilter } from "@/components/modules/jobs/JobFilter";
import { Plus } from "lucide-react";
import { JobType, Prisma } from "@prisma/client";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Manage Jobs | Authesci",
  description: "View and manage your job postings.",
};

export default async function EmployerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  if (profile.role !== "EMPLOYER") {
    redirect(`/${profile.role.toLowerCase()}/dashboard`);
  }

  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const jobType = typeof resolvedSearchParams.jobType === 'string' ? resolvedSearchParams.jobType : undefined;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const where: Prisma.JobWhereInput = {
    employerId: profile.id,
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

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: sort === 'oldest' ? 'asc' : 'desc' },
    include: {
      employer: true,
      applications: {
        include: {
          applicant: true
        }
      }
    }
  });

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Jobs</h1>
          <p className="text-neutral-500 dark:text-neutral-400">View and manage your job postings.</p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <JobFilter />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            // Map applications to the format expected by ApplicantAvatarGroup
            const formattedApplications = job.applications.map(app => ({
              id: app.id,
              user: {
                id: app.applicant.userId,
                name: app.applicant.fullName, // Use profile name as fallback
                email: app.applicant.email,
                image: app.applicant.avatarUrl // Use profile avatar
              },
              status: app.status,
              appliedAt: app.createdAt
            }));

            // Convert Decimal to number for Client Component serialization
            const serializedJob = {
              ...job,
              finalPrice: job.finalPrice ? Number(job.finalPrice) : null,
            };

            return (
              <JobCard
                key={job.id}
                job={serializedJob as any}
                isEmployer={true}
                applications={formattedApplications}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Create your first job posting to start hiring.</p>
            <Link
              href="/employer/jobs/new"
              className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors"
            >
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
