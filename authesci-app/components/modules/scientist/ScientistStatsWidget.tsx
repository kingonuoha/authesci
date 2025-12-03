import { prisma } from "@/lib/prisma";
import { StatsCard } from "../admin/StatsCard";
import { Send, Eye, Star } from "lucide-react";
import { getProfileId } from "@/lib/auth-utils";

export async function ScientistStatsWidget() {
    const userId = await getProfileId();
    if (!userId) return null;

    // Applications Sent
    const applicationsSent = await prisma.application.count({
        where: { applicantId: userId },
    });

    // Shortlisted Applications
    const shortlistedCount = await prisma.application.count({
        where: {
            applicantId: userId,
            status: "SHORTLISTED"
        },
    });

    // Profile Views (Mocked for now as we don't track this yet)
    // In a real app, we would query a 'ProfileView' table
    const profileViews = 0;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
                title="Applications Sent"
                value={applicationsSent}
                icon={Send}
                variant="blue"
            />
            <StatsCard
                title="Shortlisted"
                value={shortlistedCount}
                icon={Star}
                variant="warning"
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
