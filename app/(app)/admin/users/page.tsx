import { prisma } from "@/lib/prisma";
import { AdminUserTable } from "@/components/modules/admin/AdminUserTable";
import { PaginationControl } from "@/components/ui/pagination-control";
import { AdminUserFilters } from "@/components/modules/admin/AdminUserFilters";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

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
    const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
    const role = typeof resolvedSearchParams.role === 'string' ? resolvedSearchParams.role : undefined;
    const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : undefined;
    const date = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined;

    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    // Build Where Clause
    const where: Prisma.ProfileWhereInput = {
        AND: [
            search ? {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ]
            } : {},
            role && role !== 'ALL' ? { role: role as any } : {},
            status === 'BANNED' ? { isBanned: true } : status === 'ACTIVE' ? { isBanned: false } : {},
            date ? { createdAt: { gte: new Date(date) } } : {},
        ]
    };

    const [users, totalUsers] = await Promise.all([
        prisma.profile.findMany({
            where,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                isBanned: true,
                createdAt: true,
                lastSeenAt: true,
            },
            take: pageSize,
            skip: skip,
        }),
        prisma.profile.count({ where }),
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

            <AdminUserFilters />

            <AdminUserTable users={users} />
            <PaginationControl totalPages={totalPages} currentPage={page} />
        </div>
    );
}
