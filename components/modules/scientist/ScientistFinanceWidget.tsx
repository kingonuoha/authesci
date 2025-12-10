import { prisma } from "@/lib/prisma";
import { StatsCard } from "../admin/StatsCard";
import { DollarSign, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { getProfileId } from "@/lib/auth-utils";

export async function ScientistFinanceWidget() {
    const userId = await getProfileId();
    if (!userId) return null;

    // Total Earned: RELEASED or COMPLETED payments
    const earnedResult = await prisma.payment.aggregate({
        where: {
            scientistId: userId,
            status: { in: ["RELEASED", "COMPLETED"] },
        },
        _sum: { scientistAmount: true },
    });

    // Potential Earnings: FUNDED or PENDING payments
    const potentialResult = await prisma.payment.aggregate({
        where: {
            scientistId: userId,
            status: { in: ["FUNDED", "PENDING"] },
        },
        _sum: { scientistAmount: true },
    });

    const totalEarned = earnedResult._sum.scientistAmount || 0;
    const potentialEarnings = potentialResult._sum.scientistAmount || 0;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <StatsCard
                title="Total Earned"
                value={formatCurrency(Number(totalEarned))}
                icon={DollarSign}
                variant="cyan"
            />
            <StatsCard
                title="Potential Earnings"
                value={formatCurrency(Number(potentialEarnings))}
                icon={Wallet}
                variant="purple"
            />
        </div>
    );
}
