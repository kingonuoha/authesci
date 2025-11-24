import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import StatWidget from "@/components/modules/dashboard/StatWidget";
import Link from "next/link";
import { Briefcase, Users } from "lucide-react";
import { ProfileCompletionCard } from "@/components/modules/profile/ProfileCompletionCard";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";

export default async function EmployerDashboardPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.EMPLOYER, Role.ADMIN],
  });

  const { percentage, missingFields } = getProfileCompletion(profile);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.fullName}!</h1>

      <div className="mb-8">
        <ProfileCompletionCard percentage={percentage} missingFields={missingFields} role={profile.role} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatWidget
          title="Active Job Postings"
          value="12" // Placeholder value
          icon={Briefcase}
          iconClassName="h-6 w-6 text-blue-500"
        />
        <StatWidget
          title="New Applicants"
          value="34" // Placeholder value
          icon={Users}
          iconClassName="h-6 w-6 text-green-500"
        />
        {/* Add more StatWidget components as needed */}
      </div>

      <div className="text-center">
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post a New Job
        </Link>
      </div>
    </div>
  );
}