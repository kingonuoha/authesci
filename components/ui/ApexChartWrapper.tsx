"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import Chart component with ssr disabled to avoid hydration issues
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "350px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
        borderRadius: "8px",
        color: "#64748b",
      }}
    >
      Loading chart...
    </div>
  ),
});

interface ApexChartWrapperProps {
  options: any;
  series: any;
  type: "line" | "area" | "bar" | "pie" | "donut" | "radialBar";
  width?: string | number;
  height?: string | number;
}

export function ApexChartWrapper({
  options,
  series,
  type,
  width = "100%",
  height = "auto",
}: ApexChartWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Force remount on prop changes to reset chart state
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, [JSON.stringify(series), JSON.stringify(options)]);

  if (!isMounted) {
    return (
      <div
        style={{
          width,
          height: height === "auto" ? "350px" : height,
          backgroundColor: "#fafafa",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
        }}
      >
        Initializing chart...
      </div>
    );
  }

  const finalHeight = height === "auto" ? 350 : height;

  return (
    <Suspense
      fallback={
        <div
          style={{
            width: "100%",
            height: finalHeight,
            backgroundColor: "#fafafa",
            borderRadius: "8px",
          }}
        />
      }
    >
      <div key={key} style={{ width: "100%" }}>
        <Chart
          key={key}
          options={options}
          series={series}
          type={type}
          height={finalHeight}
          width={width}
        />
      </div>
    </Suspense>
  );
}
