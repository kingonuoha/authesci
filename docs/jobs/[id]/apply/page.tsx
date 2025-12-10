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

  // Check if profile exists
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  if (!profile) {
    redirect('/onboarding');
  }

  // 1. Restriction: Employers cannot apply
  if (profile.role === 'EMPLOYER') {
    return (
      <div className="container py-10 max-w-2xl">
        <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Job Details
        </Link>
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Employers Cannot Apply</h2>
          <p className="text-red-600 dark:text-red-300 mb-6">
            As an Employer, you cannot apply for jobs. Please switch to a Scientist account if you wish to apply.
          </p>
          <Link href="/jobs" className="btn btn-outline border-red-200 hover:bg-red-100 text-red-700 dark:border-red-800 dark:hover:bg-red-950 dark:text-red-400 px-6 py-2 rounded-lg inline-flex items-center justify-center">
            Return to Job Board
          </Link>
        </div>
      </div>
    );
  }

  // 2. Restriction: Profile Completion < 80%
  // Assuming completionScore is maintained. If not, we might need to calc on fly, but schema has it.
  if (profile.completionScore < 80) {
    return (
      <div className="container py-10 max-w-2xl">
        <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Job Details
        </Link>
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">Profile Incomplete</h2>
          <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">
            Your profile completion score is <strong>{profile.completionScore}%</strong>. You need at least <strong>80%</strong> to apply for jobs. This ensures employers get the best understanding of your qualifications.
          </p>
          <Link href="/scientist/profile" className="btn btn-primary bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg inline-flex items-center justify-center shadow-md transition-all hover:-translate-y-0.5">
            Complete Your Profile
          </Link>
        </div>
      </div>
    );
  }

  // Check if already applied
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
        <ApplicationForm jobId={job.id} userProfile={profile} screeningQuestions={job.screeningQuestions as string[]} />
      </div>
    </div>
  );
}