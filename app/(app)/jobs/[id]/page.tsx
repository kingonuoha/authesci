import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, DollarSign, Clock, ArrowLeft, Building2, Shapes, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { ApplicantAvatarGroup } from "@/components/modules/jobs/ApplicantAvatarGroup";
import Image from "next/image";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            employer: true,
            applications: {
                include: {
                    applicant: true
                }
            }
        },
    });

    if (!job) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user has already applied
    let hasApplied = false;
    if (user) {
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
        if (profile) {
            const application = await prisma.application.findUnique({
                where: {
                    jobId_applicantId: {
                        jobId: job.id,
                        applicantId: profile.id,
                    },
                },
            });
            hasApplied = !!application;
        }
    }

    return (
        <div className="container py-10 max-w-5xl">
            <Link href="/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Header */}
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-8 shadow-sm">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    {(job.employer as any).companyLogoUrl ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0 bg-white dark:bg-neutral-800">
                                            <Image
                                                src={(job.employer as any).companyLogoUrl}
                                                alt={job.employer.institution || "Company Logo"}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 flex-shrink-0">
                                            <Building2 className="w-8 h-8 text-neutral-400" />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">{job.title}</h1>
                                        <p className="text-base text-neutral-500 dark:text-neutral-400 font-medium">{job.employer.institution}</p>
                                    </div>
                                </div>
                                <span className={`badge px-4 py-1.5 rounded-full text-sm font-medium ${job.status === "ACTIVE" ? "bg-success-100 text-success-700" : "bg-neutral-100 text-neutral-700"
                                    }`}>
                                    {job.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-semibold ring-1 ring-blue-500/10">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="capitalize">{job.jobType.toLowerCase().replace("_", " ")}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg font-semibold ring-1 ring-purple-500/10">
                                    <Shapes className="w-4 h-4" />
                                    <span>{job.projectType || "Short-term"}</span>
                                </div>
                                {job.category && (
                                    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-4 py-2 rounded-lg font-medium border border-neutral-200 dark:border-neutral-700">
                                        <Info className="w-4 h-4" />
                                        <span>{job.category}</span>
                                    </div>
                                )}
                                {job.location && (
                                    <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-700/50 px-4 py-2 rounded-lg">
                                        <MapPin className="w-4 h-4" />
                                        <span>{job.location}</span>
                                    </div>
                                )}
                                {job.salaryRange && (
                                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800 shadow-sm">
                                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        <span className="font-bold text-green-700 dark:text-green-400">
                                            {job.salaryRange.replace(/\d+/g, (m) => Number(m).toLocaleString())}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-700/50 px-4 py-2 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description & Requirements */}
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-8 shadow-sm space-y-10">
                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">About the Role</h2>
                            <div className="prose max-w-none text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed text-base dark:prose-invert">
                                {job.description}
                            </div>
                        </section>

                        <div className="border-t border-neutral-100 dark:border-neutral-700 my-8"></div>

                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Requirements</h2>
                            <ul className="space-y-4 text-neutral-600 dark:text-neutral-300 text-base">
                                {job.requirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="mt-2.5 w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-300 rounded-full flex-shrink-0" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Sidebar / Sticky Actions */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Interested in this job?</h3>

                        {job.applications.length > 0 && (
                            <div className="mb-6">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                    {job.applications.length} people have applied
                                </p>
                                <ApplicantAvatarGroup
                                    applicants={job.applications.map(app => ({
                                        id: app.id,
                                        user: {
                                            id: app.applicant.id,
                                            name: app.applicant.fullName,
                                            email: app.applicant.email,
                                            image: app.applicant.avatarUrl,
                                        },
                                        status: app.status,
                                        appliedAt: app.createdAt,
                                    }))}
                                    interactive={false}
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            {job.status === "ACTIVE" && !hasApplied && (
                                <Link
                                    href={`/jobs/${job.id}/apply`}
                                    className="btn btn-primary w-full py-3 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all shadow-lg hover:shadow-xl flex items-center justify-center font-medium"
                                >
                                    Apply Now
                                </Link>
                            )}
                            {hasApplied && (
                                <div className="w-full py-3 rounded-xl bg-success-50 text-success-700 border border-success-200 flex items-center justify-center font-medium">
                                    Application Sent
                                </div>
                            )}

                            <div className="text-xs text-neutral-400 text-center mt-4">
                                Please ensure your profile is up to date before applying.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
