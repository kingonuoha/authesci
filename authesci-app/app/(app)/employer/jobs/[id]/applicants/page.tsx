import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ApplicantGrid } from "@/components/modules/jobs/ApplicantGrid";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function JobApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          applicant: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    notFound();
  }

  if (job.employerId !== profile.id) {
    redirect("/employer/jobs"); // Unauthorized
  }

  return (
    <div className="container py-10">
      <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Applicants for {job.title}</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          You have {job.applications.length} applicant{job.applications.length !== 1 && 's'} for this position.
        </p>
      </div>

      <div className="mt-6">
        <ApplicantGrid
          applicants={job.applications.map(app => ({
            id: app.id,
            user: {
              id: app.applicant.userId,
              name: app.applicant.fullName,
              email: app.applicant.email,
              image: app.applicant.avatarUrl,
              role: app.applicant.role,
            },
            status: app.status,
            appliedAt: app.createdAt,
            coverLetter: app.coverLetter,
            aiMatchScore: app.aiMatchScore,
          }))}
        />
      </div>
    </div>
  );
}
