"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { banUserAction, unbanUserAction } from "@/app/actions/admin";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isBanned: boolean;
    createdAt: Date;
}

interface AdminUserTableProps {
    users: User[];
}

export function AdminUserTable({ users }: AdminUserTableProps) {
    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        if (isBanned) {
            const result = await unbanUserAction(userId);
            if (result.success) toast.success("User unbanned");
            else toast.error("Failed to unban user");
        } else {
            const result = await MySwal.fire({
                title: 'Are you sure?',
                text: "This user will be banned from the platform.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, ban user!',
                customClass: {
                    popup: 'dark:bg-neutral-800 dark:text-white',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-neutral-300'
                }
            });

            if (result.isConfirmed) {
                const actionResult = await banUserAction(userId);
                if (actionResult.success) toast.success("User banned");
                else toast.error("Failed to ban user");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
                <div key={user.id} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white truncate" title={user.fullName}>
                                    {user.fullName}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate" title={user.email}>
                                    {user.email}
                                </p>
                            </div>
                            <Badge variant={user.isBanned ? "destructive" : "default"}>
                                {user.isBanned ? "Banned" : "Active"}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Role:</span>
                                <Badge variant="outline" className="capitalize">{user.role.toLowerCase()}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Joined:</span>
                                <span>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center gap-2">
                        {user.role !== "ADMIN" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    const result = await MySwal.fire({
                                        title: 'Promote to Admin?',
                                        text: "This user will have full access to the admin dashboard.",
                                        icon: 'question',
                                        showCancelButton: true,
                                        confirmButtonText: 'Yes, promote!',
                                        customClass: {
                                            popup: 'dark:bg-neutral-800 dark:text-white',
                                            title: 'dark:text-white',
                                            htmlContainer: 'dark:text-neutral-300'
                                        }
                                    });

                                    if (result.isConfirmed) {
                                        const { promoteUserToAdminAction } = await import("@/app/actions/admin");
                                        const actionResult = await promoteUserToAdminAction(user.id);
                                        if (actionResult.success) toast.success("User promoted to Admin");
                                        else toast.error("Failed to promote user");
                                    }
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                Promote
                            </Button>
                        )}
                        <Button
                            variant={user.isBanned ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => handleBanToggle(user.id, user.isBanned)}
                            className="w-full sm:w-auto"
                        >
                            {user.isBanned ? "Unban User" : "Ban User"}
                        </Button>
                    </div>
                </div>
            ))}

            {users.length === 0 && (
                <div className="col-span-full text-center py-12 text-neutral-500">
                    No users found.
                </div>
            )}
        </div>
    );
}
