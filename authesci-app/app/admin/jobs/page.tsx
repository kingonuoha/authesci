import { prisma } from "@/lib/prisma";
import { AdminJobTable } from "@/components/modules/admin/AdminJobTable";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Job Management | Admin",
    description: "Manage job postings",
};

export default async function AdminJobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
    const pageSize = 9;
    const skip = (page - 1) * pageSize;

    const [jobs, totalJobs] = await Promise.all([
        prisma.job.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                employer: true,
                applications: {
                    include: {
                        applicant: true,
                    },
                },
            },
            take: pageSize,
            skip: skip,
        }),
        prisma.job.count(),
    ]);

    const totalPages = Math.ceil(totalJobs / pageSize);

    // Fetch projects only for the employers in the current job list to optimize
    const employerIds = jobs.map(j => j.employerId);
    const projects = await prisma.project.findMany({
        where: {
            creatorId: { in: employerIds }
        },
        include: {
            collaborators: {
                include: {
                    user: true,
                },
            },
        },
    });

    // Transform data for the table
    const formattedJobs = jobs.map((job) => {
        // Try to find a matching project
        // Heuristic: Project created by same employer with same title
        const project = projects.find(
            (p) => p.creatorId === job.employerId && p.title === job.title
        );

        return {
            id: job.id,
            title: job.title,
            employer: job.employer,
            status: job.status,
            createdAt: job.createdAt,
            salaryRange: job.salaryRange,
            finalPrice: job.finalPrice,
            applications: job.applications,
            project: project ? {
                id: project.id,
                collaborators: project.collaborators
            } : null
        };
    });

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
                <p className="text-muted-foreground">
                    View and manage all job postings.
                </p>
            </div>

            <AdminJobTable jobs={formattedJobs} />
            <PaginationControl totalPages={totalPages} currentPage={page} />
        </div>
    );
}
