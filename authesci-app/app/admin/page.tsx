import { Metadata } from "next";
import { getAdminDashboardMetrics } from "@/app/actions/admin"; // Import the server action
import { StatsWidget } from "@/components/modules/admin/StatsWidget";
import { AdminCharts } from "@/components/modules/admin/AdminCharts";
import { RecentlyJoinedUsers } from "@/components/modules/admin/RecentlyJoinedUsers"; // To be created
import { SystemHealthCard } from "@/components/modules/admin/SystemHealthCard"; // To be created


export const metadata: Metadata = {
    title: "Admin Dashboard | Authesci",
    description: "Platform overview and analytics",
};

export default async function AdminDashboardPage() { // Make it async
    const metrics = await getAdminDashboardMetrics(); // Fetch data

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of platform performance and metrics.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatsWidget data={metrics.statCards} />
                {/* Placeholder for Total Views Today as a separate stat card if needed, or integrate into StatsWidget */}
            </div>

            <AdminCharts
                userRoleDistribution={metrics.userRoleDistribution}
                pageViewsLast77Days={metrics.pageViewsLast7Days}
                deviceRatio={metrics.deviceRatio}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentlyJoinedUsers users={metrics.recentlyJoinedUsers} />
                <SystemHealthCard health={metrics.systemHealth} />
            </div>
        </div>
    );
}
