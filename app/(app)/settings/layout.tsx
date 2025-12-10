import { getAuthenticatedUser } from "@/lib/services/auth-service";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getActiveProjectCount } from "@/lib/services/project";

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { profile } = await getAuthenticatedUser();
    const activeProjectCount = await getActiveProjectCount(profile.id);

    return (
        <DashboardLayout profile={profile} activeProjectCount={activeProjectCount}>
            {children}
        </DashboardLayout>
    );
}
