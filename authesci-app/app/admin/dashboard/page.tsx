import RoleSwitcher from "@/components/modules/RoleSwitcher";
import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";


export default async function AdminDashboardPage() {
  const { user, profile } = await getAuthenticatedUser();

  return (
    <div>
      <h1>Welcome, Admin {profile.fullName}!</h1>
      <p>This is your personalized dashboard.</p>
      {/* Add a prompt to complete profile if needed */}
      {!profile.institution && <p>Please complete your profile by adding your institution.</p>}
                      <RoleSwitcher currentRole={user.role as Role} />
      
    </div>
  );
}
