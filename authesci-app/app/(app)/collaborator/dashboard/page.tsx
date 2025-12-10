import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import StatWidget from "@/components/modules/dashboard/StatWidget";
import Link from "next/link";
import { FlaskConical, ClipboardCheck } from "lucide-react";

export default async function CollaboratorDashboardPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.COLLABORATOR, Role.ADMIN],
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.fullName}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg::grid-cols-3 gap-6 mb-8">
        <StatWidget
          title="Active Projects"
          value="5" // Placeholder value
          icon={FlaskConical}
          iconClassName="h-6 w-6 text-green-500"
        />
        <StatWidget
          title="Tasks Assigned"
          value="15" // Placeholder value
          icon={ClipboardCheck}
          iconClassName="h-6 w-6 text-blue-500"
        />
        {/* Add more StatWidget components as needed */}
      </div>

      <div className="text-center">
        <Link
          href="/collaborator/projects"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}