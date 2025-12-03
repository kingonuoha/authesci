"use client";

import { useState, useEffect, useCallback } from "react";
import { getAnalyticsLogs } from "@/app/actions/admin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Search,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    Clock,
    MapPin,
    User,
    ExternalLink,
} from "lucide-react";
import Link from "next/link";

// Simple debounce implementation if hook doesn't exist
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function LogDetailsModal({ log }: { log: any }) {
    const DeviceIcon =
        log.deviceType === "MOBILE"
            ? Smartphone
            : log.deviceType === "TABLET"
                ? Tablet
                : Monitor;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Details</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Log Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* User Section */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
                        <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={log.user?.avatarUrl || ""} />
                            <AvatarFallback>
                                {log.user?.fullName?.charAt(0).toUpperCase() || "G"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <h4 className="text-sm font-semibold">
                                {log.user?.fullName || "Guest User"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                {log.user?.email || "No email associated"}
                            </p>
                            {log.user && (
                                <Link
                                    href={`/admin/users/${log.user.id}`} // Assuming this route exists or will exist
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                >
                                    View Profile <ExternalLink className="h-3 w-3" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Globe className="h-3.5 w-3.5" />
                                Path
                            </div>
                            <p className="text-sm font-medium font-mono truncate" title={log.path}>
                                {log.path}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                IP Address
                            </div>
                            <p className="text-sm font-medium font-mono">{log.ipAddress}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <DeviceIcon className="h-3.5 w-3.5" />
                                Device
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {log.deviceType}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                Timestamp
                            </div>
                            <p className="text-sm font-medium">
                                {new Date(log.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* User Agent */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Monitor className="h-3.5 w-3.5" />
                            User Agent / Browser
                        </div>
                        <div className="p-3 rounded-md bg-muted text-xs font-mono break-all">
                            {log.userAgent || "Unknown User Agent"}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function AnalyticsTable() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deviceType, setDeviceType] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const debouncedSearch = useDebounceValue(search, 500);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getAnalyticsLogs({
                page,
                limit: 20,
                search: debouncedSearch,
                deviceType,
            });
            setData(result.data);
            setTotalPages(result.totalPages);
            setTotalRecords(result.total);
        } catch (error) {
            console.error("Failed to fetch analytics logs:", error);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, deviceType]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page when search or filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, deviceType]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by path, IP, or user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={deviceType} onValueChange={setDeviceType}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by Device" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Devices</SelectItem>
                            <SelectItem value="DESKTOP">Desktop</SelectItem>
                            <SelectItem value="MOBILE">Mobile</SelectItem>
                            <SelectItem value="TABLET">Tablet</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Path</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        {log.user ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={log.user.avatarUrl || ""} />
                                                    <AvatarFallback>
                                                        {log.user.fullName.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {log.user.fullName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                                Guest
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs max-w-[150px] truncate" title={log.path}>
                                        {log.path}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                log.deviceType === "MOBILE"
                                                    ? "secondary"
                                                    : log.deviceType === "TABLET"
                                                        ? "outline"
                                                        : "default"
                                            }
                                        >
                                            {log.deviceType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.ipAddress}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(log.timestamp), {
                                            addSuffix: true,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <LogDetailsModal log={log} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {data.length} of {totalRecords} records
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {page} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
