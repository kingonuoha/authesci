import { getAuthenticatedUser } from "@/lib/services/auth-service";
import { Role } from "@prisma/client";
import Link from "next/link";
import { ScientistProgress } from "@/components/modules/scientist/ScientistProgress";
import { ScientistFinanceWidget } from "@/components/modules/scientist/ScientistFinanceWidget";
import { OngoingProjectsList } from "@/components/modules/scientist/OngoingProjectsList";
import { ScientistStatsWidget } from "@/components/modules/scientist/ScientistStatsWidget";
import LogViewer from "@/components/modules/activity-logs/LogViewer";
import { CreditCard } from "lucide-react";
import { FeaturedCarousel } from "@/components/modules/common/FeaturedCarousel";

export default async function ScientistDashboardPage() {
  const { profile } = await getAuthenticatedUser({
    allowedRoles: [Role.SCIENTIST, Role.ADMIN],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scientist Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.fullName}
          </p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors"
        >
          Browse Jobs
        </Link>
      </div>



      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ScientistStatsWidget />
          <ScientistFinanceWidget />

          <FeaturedCarousel
            query="scientist laboratory technology research"
            captions={[
              { title: "Global Collaboration", subtitle: "Connect with researchers worldwide." },
              { title: "Cutting-edge Projects", subtitle: "Work on the latest scientific breakthroughs." },
              { title: "Secure Payments", subtitle: "Guaranteed payments via our escrow system." },
              { title: "Career Growth", subtitle: "Build your reputation and portfolio." },
              { title: "Impactful Research", subtitle: "Contribute to solving real-world problems." },
            ]}
          />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ongoing Projects</h2>
            <OngoingProjectsList />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <LogViewer userId={profile.id} limit={10} />
          </div>
        </div>

        <div className="space-y-8">
          <ScientistProgress />

          {((!profile.bankName || !profile.accountNumber) && (
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Add Bank Details
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Update your wallet settings to receive payments.
                  </p>
                </div>
              </div>
              <Link
                href="/scientist/wallet"
                className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors text-sm"
              >
                Update Wallet
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}