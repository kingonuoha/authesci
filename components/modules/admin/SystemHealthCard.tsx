"use client";

import { Card } from "@/components/ui/card";
import { ApexChartWrapper } from "@/components/ui/ApexChartWrapper";
import { Activity, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface SystemHealthCardProps {
  health: {
    totalLogs: number;
    info: number;
    warn: number;
    error: number;
    errorRate?: number;
  };
}

export function SystemHealthCard({ health }: SystemHealthCardProps) {
  const successRate = 100 - (health.errorRate || 0);

  // Determine status color and label
  let statusColor = "#10b981"; // Green
  let statusLabel = "Healthy";

  if (successRate < 76) {
    statusColor = "#f59e0b"; // Amber
    statusLabel = "Degraded";
  }
  if (successRate < 50) {
    statusColor = "#ef4444"; // Red
    statusLabel = "Critical";
  }

  const chartOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        track: { background: "#f1f5f9" },
        dataLabels: {
          show: true,
          name: { show: false },
          value: {
            show: true,
            fontSize: "18px",
            fontWeight: 700,
            offsetY: 8,
            color: statusColor,
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    colors: [statusColor],
    stroke: { lineCap: "round" },
  };

  return (
    <Card className="p-6 shadow-sm border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">System Health</h2>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusLabel === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          statusLabel === 'Degraded' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-red-50 text-red-700 border-red-200'
          }`}>
          {statusLabel}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        <div className="h-[160px] w-full flex justify-center">
          <ApexChartWrapper
            options={chartOptions}
            series={[successRate]}
            type="radialBar"
            height={180}
            width={180}
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">Operational Status</p>
        <p className="text-xs text-slate-400 mt-1">(&gt; 80% is Healthy)</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Info</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{health.info}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">Warn</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{health.warn}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Error</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{health.error}</p>
        </div>
      </div>
    </Card>
  );
}
