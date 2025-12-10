import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import Link from "next/link";
import { ProfileCompletionCard } from "@/components/modules/profile/ProfileCompletionCard";
import { getProfileCompletion } from "@/lib/helpers/getProfileCompletion";
import { EmployerStatsWidget } from "@/components/modules/employer/EmployerStatsWidget";
import { RecentApplicationsList } from "@/components/modules/employer/RecentApplicationsList";
import { FeaturedCarousel } from "@/components/modules/common/FeaturedCarousel";

export default async function EmployerDashboardPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.EMPLOYER, Role.ADMIN],
  });

  const { percentage, missingFields } = getProfileCompletion(profile);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {profile.fullName}!</h1>
        <Link
          href="/employer/jobs/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post a New Job
        </Link>
      </div>

     

      <ProfileCompletionCard percentage={percentage} missingFields={missingFields} role={profile.role} />

      <EmployerStatsWidget employerId={profile.id} />

 <FeaturedCarousel
        query="business meeting office team"
        captions={[
          { title: "Verified Experts", subtitle: "Hire pre-vetted scientists for your needs." },
          { title: "Streamlined Hiring", subtitle: "Post jobs and find talent in minutes." },
          { title: "Project Management", subtitle: "Track progress and milestones easily." },
          { title: "Secure Transactions", subtitle: "Your funds are safe until milestones are met." },
          { title: "Innovation Hub", subtitle: "Access a pool of innovative thinkers." },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-1">
        <RecentApplicationsList employerId={profile.id} />
      </div>
    </div>
  );
}