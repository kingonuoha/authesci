"use client";

import { Card } from "@/components/ui/card";
import { ApexChartWrapper } from "@/components/ui/ApexChartWrapper";
import { Briefcase, Users, FlaskConical, Car } from "lucide-react"; // Using Car as placeholder for 'Cars' from example, though maybe not relevant to science app

interface PlatformOverviewProps {
    overview: {
        jobs: { total: number; active: number };
        scientists: { total: number; count: number };
        projects: { total: number; active: number };
    };
}

export function PlatformOverview({ overview }: PlatformOverviewProps) {
    // Calculate percentages for the radial charts
    // Assuming 'total' is the max/goal for the radial progress
    // For scientists, maybe % of total users?
    // For jobs, % active vs total?
    // For projects, % active vs total?

    const jobPercentage = overview.jobs.total > 0 ? (overview.jobs.active / overview.jobs.total) * 100 : 0;
    const scientistPercentage = overview.scientists.total > 0 ? (overview.scientists.count / overview.scientists.total) * 100 : 0;
    const projectPercentage = overview.projects.total > 0 ? (overview.projects.active / overview.projects.total) * 100 : 0;

    // Mocking a 4th metric to match the design (e.g., "Verified Users" or something similar)
    const verifiedPercentage = 65;

    const createChartOptions = (color: string) => ({
        chart: {
            type: "radialBar",
            height: 60,
            width: 60,
            sparkline: { enabled: true },
        },
        plotOptions: {
            radialBar: {
                hollow: { size: "45%" },
                track: { background: "#f1f5f9" },
                dataLabels: {
                    show: true,
                    name: { show: false },
                    value: {
                        show: true,
                        fontSize: "10px",
                        fontWeight: 600,
                        offsetY: 4,
                        color: "#1e293b",
                        formatter: (val: number) => val.toFixed(0),
                    },
                },
            },
        },
        colors: [color],
        stroke: { lineCap: "round" },
    });

    const items = [
        {
            label: "Active Jobs",
            value: overview.jobs.active,
            total: overview.jobs.total,
            icon: Briefcase,
            iconBg: "bg-blue-100 text-blue-600",
            color: "#3b82f6",
            percentage: jobPercentage,
        },
        {
            label: "Scientists",
            value: overview.scientists.count,
            total: overview.scientists.total, // Total users
            icon: Users,
            iconBg: "bg-orange-100 text-orange-600",
            color: "#f97316",
            percentage: scientistPercentage,
        },
        {
            label: "Active Projects",
            value: overview.projects.active,
            total: overview.projects.total,
            icon: FlaskConical,
            iconBg: "bg-amber-100 text-amber-600",
            color: "#f59e0b",
            percentage: projectPercentage,
        },
        {
            label: "Verified Users", // Placeholder metric
            value: Math.floor(overview.scientists.total * 0.65),
            total: overview.scientists.total,
            icon: Car, // Just using a placeholder icon
            iconBg: "bg-emerald-100 text-emerald-600",
            color: "#10b981",
            percentage: verifiedPercentage,
        },
    ];

    return (
        <Card className="p-6 shadow-sm border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Platform Overview</h2>
                <select className="text-sm border-none bg-transparent text-slate-500 font-medium focus:ring-0 cursor-pointer">
                    <option>Yearly</option>
                    <option>Monthly</option>
                    <option>Weekly</option>
                </select>
            </div>

            <div className="space-y-6">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.value} / {item.total}
                                </p>
                            </div>
                        </div>
                        <div className="h-[60px] w-[60px]">
                            <ApexChartWrapper
                                options={createChartOptions(item.color)}
                                series={[item.percentage]}
                                type="radialBar"
                                height={60}
                                width={60}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
