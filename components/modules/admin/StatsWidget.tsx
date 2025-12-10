import { LucideIcon, Users, Briefcase, DollarSign, Wallet, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card'; // Assuming shadcn Card exists and is appropriate
import { Prisma } from '@prisma/client'; // Import Prisma to handle Decimal type

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string; // Tailwind class for background color
}

function StatCard({ title, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <Card className={`flex flex-col justify-between p-4 rounded-lg shadow-sm text-white ${colorClass}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <Icon className="h-6 w-6 opacity-75" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </Card>
  );
}

interface StatsWidgetProps {
  data: {
    totalUsers: number;
    activeJobs: number;
    totalRevenue: number | Prisma.Decimal; // Allow Prisma.Decimal here for type safety
    pendingPayouts: number | Prisma.Decimal; // Allow Prisma.Decimal here for type safety
    totalViewsToday: number;
  };
}

export function StatsWidget({ data }: StatsWidgetProps) {
  // Helper to format currency
  const formatCurrency = (amount: number | Prisma.Decimal) => {
    // Check if amount is a Prisma.Decimal and convert if necessary
    const numAmount = typeof amount === 'object' && 'toNumber' in amount ? amount.toNumber() : amount;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(numAmount);
  };

  return (
    <>
      <StatCard
        title="Total Users"
        value={data.totalUsers}
        icon={Users}
        colorClass="bg-gradient-to-r from-info-500 to-info-700"
      />
      <StatCard
        title="Active Jobs"
        value={data.activeJobs}
        icon={Briefcase}
        colorClass="bg-gradient-to-r from-success-500 to-success-700"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        icon={DollarSign}
        colorClass="bg-gradient-to-r from-purple-700 to-purple-400"
      />
      <StatCard
        title="Pending Payouts"
        value={formatCurrency(data.pendingPayouts)}
        icon={Wallet}
        colorClass="bg-gradient-to-r from-warning-500 to-warning-700"
      />
      <StatCard
        title="Views Today"
        value={data.totalViewsToday}
        icon={Eye}
        colorClass="bg-gradient-to-r from-danger-500 to-danger-700"
      />
    </>
  );
}