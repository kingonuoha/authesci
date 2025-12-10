import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { JobForm } from "@/components/modules/jobs/JobForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditJobPage({ params }: { params: { id: string } }) {
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
  });

  if (!job) {
    notFound();
  }

  if (job.employerId !== profile.id) {
    redirect("/employer/jobs"); // Unauthorized
  }

  // Only allow editing if not converted to project (CLOSED)
  if (job.status === "CLOSED") {
      redirect("/employer/jobs");
  }

  return (
    <div className="container py-10 max-w-3xl">
      <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Job</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Update the details of your job listing.</p>
      </div>

      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-8 shadow-sm">
        <JobForm initialData={job} jobId={job.id} />
      </div>
    </div>
  );
}
