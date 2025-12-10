import { Metadata } from "next";
import AnalyticsTable from "@/components/modules/admin/AnalyticsTable";

export const metadata: Metadata = {
    title: "Analytics Logs | Admin Dashboard",
    description: "View detailed application analytics logs.",
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Logs</h1>
                <p className="text-muted-foreground">
                    View detailed page view logs, filter by device, and search by user or path.
                </p>
            </div>
            <AnalyticsTable />
        </div>
    );
}
