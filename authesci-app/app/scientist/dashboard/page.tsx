import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import StatWidget from "@/components/modules/dashboard/StatWidget";
import Link from "next/link";
import { FileText, FlaskConical, CreditCard } from "lucide-react";
import { ProfileCompletionCard } from "@/components/modules/profile/ProfileCompletionCard";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";

export default async function ScientistDashboardPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.SCIENTIST, Role.ADMIN],
  });

  const { percentage, missingFields } = getProfileCompletion(profile);

  return (
    <>
      <div className="mb-6 space-y-6">
        <ProfileCompletionCard percentage={percentage} missingFields={missingFields} role={profile.role} />
        
        {(!profile.bankName || !profile.accountNumber || profile.bankName === "" || profile.accountNumber === "") && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                  Add Bank Details to Get Paid
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-xl">
                  You haven't added your bank account information yet. Please update your wallet settings to receive payments for your projects.
                </p>
              </div>
            </div>
            <Link 
              href="/scientist/wallet" 
              className="whitespace-nowrap px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Add Bank Details
            </Link>
          </div>
        )}
      </div>

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