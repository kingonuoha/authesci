import { Metadata } from "next";
import { getAdminDashboardMetrics } from "@/app/actions/admin";
import { StatsWidget } from "@/components/modules/admin/StatsWidget";
import { AdminCharts } from "@/components/modules/admin/AdminCharts";
import { RecentlyJoinedUsers } from "@/components/modules/admin/RecentlyJoinedUsers";
import { SystemHealthCard } from "@/components/modules/admin/SystemHealthCard";
import { PlatformOverview } from "@/components/modules/admin/PlatformOverview";

export const metadata: Metadata = {
  title: "Admin Dashboard | Authesci",
  description: "Platform overview and analytics",
};

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

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
      </div>

      <AdminCharts
        userRoleDistribution={metrics.userRoleDistribution}
        pageViewsLast77Days={metrics.pageViewsLast7Days}
        deviceRatio={metrics.deviceRatio}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PlatformOverview overview={metrics.platformOverview} />
        </div>
        <div className="lg:col-span-1">
          <SystemHealthCard health={metrics.systemHealth} />
        </div>
        <div className="lg:col-span-1">
          <RecentlyJoinedUsers users={metrics.recentlyJoinedUsers} />
        </div>
      </div>
    </div>
  );
}
