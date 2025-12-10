import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { JobCard } from "@/components/modules/jobs/JobCard";
import { JobFilter } from "@/components/modules/jobs/JobFilter";
import { JobStatus, JobType, Prisma, Role } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { rankJobs, isAIEnabled, isAiFreeAccess } from "@/lib/ai/service";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Auth & Role Check
    let profile = null;
    if (user) {
        profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            select: { role: true, id: true, isPremium: true } // Fetch specific fields
        });
    }

    // 2. Unauthorized View (Teaser)
    // If not logged in OR not a scientist
    if (!profile || profile.role !== Role.SCIENTIST) {
        return (
            <div className="container py-20 max-w-7xl mx-auto text-center space-y-8 min-h-[60vh] flex flex-col justify-center items-center animate-in fade-in duration-700">
                <div className="h-24 w-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg shadow-blue-500/10">
                    <Lock size={48} />
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                    Unlock Authesci's Job Market
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    Exclusive access to premium research grants, academic positions, and industry collaborations is reserved for verified <span className="text-blue-600 dark:text-blue-400 font-semibold">Scientists</span>.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 w-full max-w-md mx-auto">
                    {profile && profile.role !== Role.SCIENTIST ? (
                        <div className="text-center w-full">
                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-6 py-4 rounded-xl mb-6 border border-amber-200 dark:border-amber-800">
                                <p className="font-medium mb-1">Access Restricted</p>
                                <p className="text-sm">
                                    You are currently logged in as an <strong>{profile.role}</strong>.<br />
                                    The Job Market is exclusively for Scientists to find opportunities.
                                </p>
                            </div>
                            <Link href={`/${profile.role.toLowerCase()}/dashboard`} className="w-full sm:w-auto">
                                <Button size="lg" className="w-full text-lg h-12 px-8 font-semibold shadow-lg transition-all">
                                    Go to {profile.role} Dashboard
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/login?next=/jobs" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full text-lg h-12 px-8 font-semibold shadow-lg hover:shadow-blue-500/25 transition-all">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register?role=SCIENTIST" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full text-lg h-12 px-8 flex items-center gap-2 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    Join as Scientist
                                    <ArrowRight size={20} />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {!user && (
                    <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 w-full max-w-md mx-auto">
                        Are you an Institution or Employer? <br />
                        <Link href="/register?type=employer" className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1 mt-1">
                            Post a Project Here
                        </Link>
                    </p>
                )}
            </div>
        );
    }

    // 3. Authenticated Job Board View
    // Handle 'q' from Hero search OR 'search' from embedded filter
    const search = (typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : "") || (typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined);
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
            { employer: { institution: { contains: search, mode: 'insensitive' } } }, // Added institution search
        ];
    }

    if (category && category !== 'all') {
        where.category = category;
    }

    if (jobType && jobType !== 'all' && Object.values(JobType).includes(jobType as JobType)) {
        where.jobType = jobType as JobType;
    }

    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
    const pageSize = 9;
    const skip = (page - 1) * pageSize;

    const [jobs, totalJobs] = await Promise.all([
        prisma.job.findMany({
            where,
            include: {
                employer: true,
                _count: {
                    select: { applications: true }
                }
            },
            orderBy: {
                createdAt: sort === 'oldest' ? 'asc' : 'desc',
            },
            take: pageSize,
            skip: skip,
        }),
        prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(totalJobs / pageSize);

    // AI Sorting optimization for current page
    let displayedJobs = jobs;

    if (user && isAIEnabled()) {
        const isFree = isAiFreeAccess();
        // profile is already fetched above
        if (profile && (isFree || profile.isPremium)) {
            // Rank the current page of jobs
            // Need to cast profile to match what rankJobs expects if it expects a full profile
            // For now assuming it works or we re-fetch if needed. 
            // rankJobs likely needs more fields than just role/id. Let's fetch full profile if AI is enabled.
            const fullProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
            if (fullProfile) {
                const rankedJobs = await rankJobs(fullProfile, jobs);
                if (rankedJobs && rankedJobs.length > 0) {
                    displayedJobs = rankedJobs as any;
                }
            }
        }
    }

    return (
        <div className="container py-10">
            <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Job Board</h1>
                    <p className="text-muted-foreground">Find your next opportunity in science and research.</p>
                </div>
                {/* Only show if search is active */}
                {search && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Search: "{search}"
                    </div>
                )}
            </div>

            <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading jobs...</div>}>
                <JobFilter />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {displayedJobs.length > 0 ? (
                        displayedJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={{
                                    ...job,
                                    finalPrice: job.finalPrice ? Number(job.finalPrice) : null,
                                } as any}
                            />
                        ))
                    ) : (
                        <div className="col-span-full count-title text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                            <div className="mx-auto w-12 h-12 text-slate-300 mb-3">
                                <BriefcaseIcon />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No jobs found</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
                            {search && (
                                <Link href="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">Clear Search</Link>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <PaginationControl totalPages={totalPages} currentPage={page} />
                </div>
            </Suspense>
        </div>
    );
}

function BriefcaseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    )
}
