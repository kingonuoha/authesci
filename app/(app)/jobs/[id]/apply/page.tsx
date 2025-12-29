import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ApplicationForm } from "@/components/modules/jobs/ApplicationForm";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const job = await prisma.job.findUnique({
        where: { id },
        include: { employer: true },
    });

    if (!job) {
        notFound();
    }

    if (job.status === "CLOSED" || job.status === "PENDING_PAYMENT") {
        return (
            <div className="container py-20 max-w-2xl text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <ArrowLeft className="w-8 h-8 text-neutral-400" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">Job Closed</h1>
                <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                    This position is no longer accepting applications.
                </p>
                <Link href="/jobs" className="btn btn-primary px-8 py-3 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-colors">
                    Back to Job Board
                </Link>
            </div>
        );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/jobs/${id}/apply`);
    }

    // Check if profile exists and validating eligibility
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

    if (!profile) {
        redirect('/onboarding');
    }

    // 1. Restriction: Employers cannot apply
    if (profile.role === Role.EMPLOYER) {
        return (
            <div className="container py-10 max-w-2xl">
                <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Job Details
                </Link>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Employers Cannot Apply</h2>
                    <p className="text-red-600 dark:text-red-300 mb-6">
                        As an Employer, you cannot apply for jobs. Please switch to a Scientist account if you wish to apply.
                    </p>
                    <Link href="/jobs" className="inline-flex items-center justify-center px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium">
                        Return to Job Board
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Restriction: Profile Completion < 80% (Optional: Adjust score as needed or remove if not using score field)
    // Checking if completionScore exists on profile, assuming default 0 if null
    const score = profile.completionScore || 0;
    if (score < 80) {
        return (
            <div className="container py-10 max-w-2xl">
                <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Job Details
                </Link>
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-2">Profile Incomplete</h2>
                    <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">
                        Your profile completion score is <strong>{score}%</strong>. You need at least <strong>80%</strong> to apply for jobs. This ensures employers get the best understanding of your qualifications.
                    </p>
                    <Link href="/scientist/profile" className="inline-flex items-center justify-center px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium">
                        Complete Your Profile
                    </Link>
                </div>
            </div>
        );
    }

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
            <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Job Details
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
                    Apply for <span className="text-blue-600 dark:text-blue-400">{job.title}</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">at <span className="font-semibold text-slate-700 dark:text-slate-300">{job.employer.institution}</span></p>
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
                <ApplicationForm jobId={job.id} userProfile={profile} screeningQuestions={job.screeningQuestions as string[]} />
            </div>
        </div>
    );
}
