import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import DashboardLayout from "@/components/layouts/DashboardLayout";
// Removed `headers` import
// Removed `URL` import

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Removed headers() call and pathname extraction
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.EMPLOYER, Role.ADMIN],
    // Removed pathname argument
  });

  return (
    <DashboardLayout profile={profile}>
      {children}
    </DashboardLayout>
  );
}
