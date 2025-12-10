import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile } = await getAuthenticatedUser({
        allowedRoles: [Role.ADMIN],
    });

    // Admin might not have "active projects" in the same way, or we can pass 0
    return (
        <DashboardLayout profile={profile} activeProjectCount={0}>
            {children}
        </DashboardLayout>
    );
}
