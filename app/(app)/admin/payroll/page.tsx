import { getPayouts, getPayoutStats } from "@/app/(app)/actions/payment";
import { PayrollTable } from "@/components/modules/admin/PayrollTable";
import { AlertCircle, DollarSign, Clock, CheckCircle, Wallet } from "lucide-react";
import { StatsCard } from "@/components/modules/admin/StatsCard";
import { formatCurrency } from "@/lib/formatCurrency";

export const metadata = {
    title: "Payroll Management | Authesci Admin",
    description: "Manage scientist payouts",
};

export default async function AdminPayrollPage() {
    const [payoutsResult, statsResult] = await Promise.all([
        getPayouts(),
        getPayoutStats()
    ]);

    if (payoutsResult.error || statsResult.error) {
        return (
            <div className="container mx-auto py-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-800 dark:text-red-200">
                    <AlertCircle className="w-5 h-5" />
                    <p>Error loading payroll data: {payoutsResult.error || statsResult.error}</p>
                </div>
            </div>
        );
    }

    const payouts = payoutsResult.data || [];
    const stats = statsResult.data || { pendingCount: 0, pendingAmount: 0, completedCount: 0, completedAmount: 0, paystackBalance: 0 };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Payroll & Payouts</h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Review and process pending payouts for completed projects.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Pending Payouts"
                    value={stats.pendingCount}
                    icon={Clock}
                    variant="warning"
                    description={formatCurrency(stats.pendingAmount)}
                />
                <StatsCard
                    title="Completed Payouts"
                    value={stats.completedCount}
                    icon={CheckCircle}
                    variant="success"
                    description={formatCurrency(stats.completedAmount)}
                />
                <StatsCard
                    title="Total Payouts Value"
                    value={formatCurrency(stats.pendingAmount + stats.completedAmount)}
                    icon={DollarSign}
                    variant="default"
                />
                <StatsCard
                    title="Paystack Balance"
                    value={formatCurrency(stats.paystackBalance || 0)}
                    icon={Wallet}
                    variant="purple"
                />
            </div>

            <PayrollTable payouts={payouts} />
        </div>
    );
}
