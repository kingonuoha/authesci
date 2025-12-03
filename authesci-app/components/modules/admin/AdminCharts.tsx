"use client";

import { ApexChartWrapper } from "@/components/ui/ApexChartWrapper";
import { Card } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { getAnalyticsChartData } from "@/app/actions/admin";

interface AdminChartsProps {
  userRoleDistribution: { name: string; value: number }[];
  // pageViewsLast77Days is no longer the primary source for the main chart, but we can keep it for initial state or remove it
  pageViewsLast77Days: { date: string; count: number }[];
  deviceRatio: { name: string; value: number; percentage: number }[];
}

export function AdminCharts({ userRoleDistribution, deviceRatio }: AdminChartsProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState<{ date: string; total: number; desktop: number; mobile: number; tablet: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAnalyticsChartData(period);
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  // --- Page Views (Layered Area Chart) ---
  const pageViewsOptions = {
    chart: {
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      stacked: false,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: {
      categories: chartData.map(d => d.date),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#64748b', fontSize: '12px' }
      },
      tooltip: { enabled: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px' },
        formatter: (value: number) => value.toFixed(0)
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    colors: ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981'], // Violet (Total), Blue, Pink, Emerald
    tooltip: {
      theme: 'light',
      shared: true,
      intersect: false,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    }
  };

  const pageViewsSeries = [
    {
      name: 'Total Views',
      type: 'area',
      data: chartData.map(d => d.total)
    },
    {
      name: 'Desktop',
      type: 'area',
      data: chartData.map(d => d.desktop)
    },
    {
      name: 'Mobile',
      type: 'area',
      data: chartData.map(d => d.mobile)
    },
    {
      name: 'Tablet',
      type: 'area',
      data: chartData.map(d => d.tablet)
    }
  ];

  // --- User Role Distribution (Modern Donut) ---
  const userRoleOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif',
    },
    labels: userRoleDistribution.map(d => d.name),
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], // Blue, Emerald, Amber, Red
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, fontSize: '14px', color: '#64748b' },
            value: { show: true, fontSize: '24px', fontWeight: 600, color: '#0f172a' },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '14px',
              color: '#64748b',
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
              }
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', fontSize: '14px', markers: { radius: 12 } },
    stroke: { show: false }
  };
  const userRoleSeries = userRoleDistribution.map(d => d.value);

  // --- Device Usage (Modern RadialBar) ---
  const deviceRatioOptions = {
    chart: {
      type: 'radialBar',
      fontFamily: 'Inter, sans-serif',
    },
    labels: deviceRatio.map(d => d.name),
    plotOptions: {
      radialBar: {
        hollow: { size: '60%', background: 'transparent' },
        track: { background: '#f1f5f9' },
        dataLabels: {
          name: { show: true, fontSize: '14px', color: '#64748b', offsetY: -10 },
          value: { show: true, fontSize: '24px', fontWeight: 600, color: '#0f172a', offsetY: 5 },
          total: {
            show: true,
            label: 'Total',
            color: '#64748b',
            formatter: function (w: any) {
              return deviceRatio.reduce((sum, d) => sum + d.value, 0).toString();
            }
          }
        }
      }
    },
    colors: ['#8b5cf6', '#ec4899', '#06b6d4'], // Violet, Pink, Cyan
    stroke: { lineCap: 'round' },
    legend: { show: true, position: 'bottom', fontSize: '14px', markers: { radius: 12 } }
  };
  const deviceRatioSeries = deviceRatio.map(d => parseFloat(d.percentage.toFixed(2)));

  return (
    <div className="space-y-6">
      {/* Row 1: Page Views (Full Width) */}
      <Card className="p-6 shadow-sm border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-white dark:bg-slate-950">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Page Views Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Traffic trends by device</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {(['day', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${period === p
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-[350px]">
          <ApexChartWrapper
            options={pageViewsOptions}
            series={pageViewsSeries}
            type="area"
            height={350}
          />
        </div>
      </Card>

      {/* Row 2: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-sm border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-white dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6">User Role Distribution</h2>
          <ApexChartWrapper
            options={userRoleOptions}
            series={userRoleSeries}
            type="donut"
            height={350}
          />
        </Card>

        <Card className="p-6 shadow-sm border-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-white dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6">Device Usage</h2>
          <ApexChartWrapper
            options={deviceRatioOptions}
            series={deviceRatioSeries}
            type="radialBar"
            height={350}
          />
        </Card>
      </div>
    </div>
  );
}