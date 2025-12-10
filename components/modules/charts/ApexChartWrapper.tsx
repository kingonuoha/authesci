"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";

// Dynamically import react-apexcharts with no SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ApexChartWrapperProps {
    options: ApexOptions;
    series: any[];
    type: "area" | "line" | "bar" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "boxPlot" | "radar" | "polarArea" | "rangeBar" | "rangeArea" | "treemap";
    height?: number | string;
    width?: number | string;
}

export default function ApexChartWrapper(props: ApexChartWrapperProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div style={{ height: props.height || 350, width: "100%" }} />;

    return (
        <div className="apex-chart-wrapper">
            <Chart {...props} />
        </div>
    );
}
