"use client";

import { useEffect, useState } from "react";
import { getLogsAction } from "@/app/actions/logs";
import { formatDistanceToNow } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LogViewerClientProps {
    userId?: string;
    limit?: number;
    isAdminView?: boolean;
}

export default function LogViewerClient({ userId, limit = 50, isAdminView = false }: LogViewerClientProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getLogsAction(limit, userId);
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch logs", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [limit, userId]);

    if (isLoading) {
        return <div className="text-center p-4">Loading logs...</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Message</TableHead>
                        {isAdminView && <TableHead>User</TableHead>}
                        <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={isAdminView ? 5 : 4} className="h-24 text-center">
                                No logs found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.action}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            log.status === "SUCCESS"
                                                ? "default"
                                                : log.status === "FAILURE"
                                                    ? "destructive"
                                                    : "secondary"
                                        }
                                    >
                                        {log.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-md truncate" title={log.message}>
                                    {log.message}
                                </TableCell>
                                {isAdminView && (
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.user?.fullName || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{log.user?.email || ''}</span>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell className="text-right text-muted-foreground">
                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
