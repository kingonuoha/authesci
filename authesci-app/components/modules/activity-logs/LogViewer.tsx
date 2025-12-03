import { prisma } from "@/lib/prisma";
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

interface LogViewerProps {
    userId?: string;
    limit?: number;
    isAdminView?: boolean;
}

export default async function LogViewer({ userId, limit = 50, isAdminView = false }: LogViewerProps) {
    const where = userId ? { userId } : {};

    const logs = await prisma.log.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            user: {
                select: {
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                },
            },
        },
    });

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
                                            <span className="font-medium">{log.user.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{log.user.email}</span>
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
