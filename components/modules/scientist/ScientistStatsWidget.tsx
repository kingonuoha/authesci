import { prisma } from "@/lib/prisma";
import { StatsCard } from "../admin/StatsCard";
import { Send, Eye, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function ScientistStatsWidget() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { id: true, userId: true }
    });

    if (!profile) return null;

    // Applications Sent
    const applicationsSent = await prisma.application.count({
        where: { applicantId: profile.id },
    });

    // Hired Applications (Count projects where user is a collaborator)
    // The user stated "once hired the job changes to a project", so we count active collaborations.
    const hiredCount = await prisma.collaborator.count({
        where: {
            userId: profile.id,
            status: { not: "INVITED" } // Count all valid statuses (ACTIVE, LEFT, REMOVED) implies they were hired
        },
    });

    // Profile Views (Real data, excluding self-views)
    const profileViews = await prisma.pageView.count({
        where: {
            // Check for UserID in path because routes are /employer/applicants/[userId]
            path: { contains: profile.userId },
            userId: { not: profile.userId }
        }
    });

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Link href="/scientist/applications">
                <StatsCard
                    title="Applications Sent"
                    value={applicationsSent}
                    icon={Send}
                    variant="cyan"
                    className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                />
            </Link>
            <StatsCard
                title="Hired"
                value={hiredCount}
                icon={Star}
                variant="warning"
                description="Total projects joined"
            />
            <StatsCard
                title="Profile Views"
                value={profileViews}
                icon={Eye}
                variant="purple"
            />
        </div>
    );
}
