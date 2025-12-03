import { prisma } from "@/lib/prisma";
import { AdminUserTable } from "@/components/modules/admin/AdminUserTable";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "User Management | Admin",
    description: "Manage platform users",
};

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
        prisma.profile.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isBanned: true,
                createdAt: true,
            },
            take: pageSize,
            skip: skip,
        }),
        prisma.profile.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">
                    View and manage all registered users.
                </p>
            </div>

            <AdminUserTable users={users} />
            <PaginationControl totalPages={totalPages} currentPage={page} />
        </div>
    );
}
