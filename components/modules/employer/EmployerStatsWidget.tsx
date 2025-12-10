import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/modules/admin/StatsCard";
import { Briefcase, Users, FileText } from "lucide-react";

export async function EmployerStatsWidget({ employerId }: { employerId: string }) {
    const [activeJobs, totalApplicants, pendingReviews] = await Promise.all([
        prisma.job.count({
            where: { employerId, status: "ACTIVE" }
        }),
        prisma.application.count({
            where: { job: { employerId } }
        }),
        prisma.application.count({
            where: { job: { employerId }, status: "PENDING" }
        })
    ]);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
                title="Active Jobs"
                value={activeJobs}
                icon={Briefcase}
                variant="purple"
            />
            <StatsCard
                title="Total Applicants"
                value={totalApplicants}
                icon={Users}
                variant="cyan"
            />
            <StatsCard
                title="Pending Reviews"
                value={pendingReviews}
                icon={FileText}
                variant="warning"
            />
        </div>
    );
}
