"use client";

import ApexChartWrapper from "@/components/modules/charts/ApexChartWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn utility
import { ApexOptions } from "apexcharts";

// Helper to format bytes into a readable string
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface StorageAnalyticsProps {
  totalStorageUsed: number;
  totalStorageCapacity: number;
  topUsersByStorage: {
    id: string;
    fullName: string;
    email: string;
    storageUsed: number;
  }[];
  className?: string; // Add className prop
}

export function StorageAnalyticsChart({
  totalStorageUsed,
  totalStorageCapacity,
  topUsersByStorage,
  className, // Destructure className
}: StorageAnalyticsProps) {
  const percentageUsed = totalStorageCapacity > 0 ? (totalStorageUsed / totalStorageCapacity) * 100 : 0;
  const percentageAvailable = 100 - percentageUsed;

  const chartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      height: 250,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
          margin: 5, // margin is in pixels
          dropShadow: {
            enabled: false,
            top: 2,
            left: 0,
            color: "#999",
            opacity: 1,
            blur: 2,
          },
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: "22px",
            formatter: function (val: number) {
              return val + "%";
            },
          },
        },
      },
    },
    grid: {
      padding: {
        top: -10,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91],
      },
    },
    stroke: {
      dashArray: 4,
    },
    labels: ["Storage Used"],
    colors: ["#3b82f6"], // Blue color
  };

  const series = [parseFloat(percentageUsed.toFixed(2))];

  return (
    <Card className={cn("col-span-12 lg:col-span-6 xl:col-span-4", className)}>
      {/* Merge classNames */}
      <CardHeader>
        <CardTitle>Storage Analytics</CardTitle>
        <CardDescription>Platform-wide file storage usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <ApexChartWrapper options={chartOptions} series={series} type="radialBar" height={250} width="100%" />
          <div className="text-center mt-[-50px] mb-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total: {formatBytes(totalStorageUsed)} / {formatBytes(totalStorageCapacity)}
            </p>
          </div>
        </div>

        <h4 className="text-md font-semibold mt-4 mb-2 dark:text-white">Top Users by Storage</h4>
        <ul className="space-y-2 text-sm">
          {topUsersByStorage.length > 0 ? (
            topUsersByStorage.map((user) => (
              <li key={user.id} className="flex justify-between items-center py-1">
                <span className="text-neutral-700 dark:text-neutral-300 truncate mr-2" title={user.fullName}>
                  {user.fullName} ({user.email})
                </span>
                <span className="font-medium text-neutral-900 dark:text-white flex-shrink-0">
                  {formatBytes(user.storageUsed)}
                </span>
              </li>
            ))
          ) : (
            <li className="text-neutral-500 dark:text-neutral-400">No users with storage data yet.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

