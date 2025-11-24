import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ApplicationForm } from "@/components/modules/jobs/ApplicationForm";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { employer: true },
  });

  if (!job || job.status !== "ACTIVE") {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/jobs/${id}/apply`);
  }

  // Check if already applied
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (profile) {
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId: job.id,
          applicantId: profile.id,
        },
      },
    });

    if (existingApplication) {
      redirect(`/jobs/${job.id}`); // Already applied
    }
  }

  return (
    <div className="container py-10 max-w-2xl">
      <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Job Details
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
          Apply for <span className="text-primary-600 dark:text-primary-foreground">{job.title}</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">at <span className="font-bold">{job.employer.institution}</span></p>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm">
        <ApplicationForm jobId={job.id} userProfile={profile} />
      </div>
    </div>
  );
}
