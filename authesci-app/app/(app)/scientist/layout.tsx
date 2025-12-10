import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getActiveProjectCount } from "@/lib/services/project";

export default async function ScientistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.SCIENTIST, Role.ADMIN],
  });

  const activeProjectCount = await getActiveProjectCount(profile.id);

  return (
    <DashboardLayout profile={profile} activeProjectCount={activeProjectCount}>
      {children}
    </DashboardLayout>
  );
}
