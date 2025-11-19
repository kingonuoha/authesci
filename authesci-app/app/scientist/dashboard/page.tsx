import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import StatWidget from "@/components/modules/dashboard/StatWidget";
import Link from "next/link";
import { FileText, FlaskConical } from "lucide-react";

export default async function ScientistDashboardPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.SCIENTIST, Role.ADMIN],
  });

  return (
    <>
      {/* Removed h1 tag */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6"> {/* Matches template's first grid */}
        <StatWidget
          title="Applications Submitted"
          value="7" // Placeholder value
          icon={FileText}
          iconClassName="h-6 w-6 text-purple-500"
        />
        <StatWidget
          title="Projects Joined"
          value="3" // Placeholder value
          icon={FlaskConical}
          iconClassName="h-6 w-6 text-orange-500"
        />
        {/* Add more StatWidget components as needed */}
      </div>

      <div className="text-center mt-6"> {/* Added mt-6 for spacing, similar to template's second grid */}
        <Link
          href="/scientist/jobs"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Browse Jobs
        </Link>
      </div>
    </>
  );
}