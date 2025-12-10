import LogViewer from "@/components/modules/activity-logs/LogViewer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Logs | Admin",
    description: "View all system logs",
};

export default function AdminLogsPage() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
                <p className="text-muted-foreground">
                    Audit trail of all system activities.
                </p>
            </div>

            <LogViewer isAdminView={true} limit={100} />
        </div>
    );
}
