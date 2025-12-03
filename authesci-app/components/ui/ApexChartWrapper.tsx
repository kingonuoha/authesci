"use client";

import React, { useEffect, useRef } from 'react';

interface ApexChartWrapperProps {
  options: any;
  series: any;
  type: "line" | "area" | "bar" | "pie" | "donut" | "radialBar";
  width?: string | number;
  height?: string | number;
}

export function ApexChartWrapper({ options, series, type, width = "100%", height = "auto" }: ApexChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !chartRef.current) return;

    let mounted = true;

    const initChart = async () => {
      try {
        const ApexCharts = (await import('apexcharts')).default;

        if (!mounted || !chartRef.current) return;

        // Destroy existing instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const chartOptions = {
          ...options,
          series: series,
          chart: {
            ...options.chart,
            type: type,
            height: height,
            width: width,
          },
        };

        const chart = new ApexCharts(chartRef.current, chartOptions);
        chart.render();
        chartInstance.current = chart;
      } catch (error) {
        console.error("Failed to initialize ApexChart:", error);
      }
    };

    initChart();

    return () => {
      mounted = false;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [options, series, type, width, height]);

  return <div ref={chartRef} style={{ width, height, minHeight: '300px' }} />;
}
