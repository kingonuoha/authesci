"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, WifiOff, Beaker } from "lucide-react";

const SCIENTIFIC_ERRORS = [
    "System Error: The hypothesis was rejected due to an unexpected exception.",
    "Critical Failure: Entropy levels in the server room exceeded safety limits.",
    "Calculation Error: The data refused to align with the expected model.",
    "Runtime Anomaly: A wild undefined variable disrupted the control group.",
    "Connection Lost: Our servers are currently undergoing an unplanned peer review.",
    "State Collapse: The application state is simultaneously broken and working (mostly broken).",
    "Processing Error: Unexpected chemical reaction detected in the logic gates.",
    "Resource Depletion: The hamster powering the server has submitted a resignation letter.",
    "Pipeline Fracture: The flow of data encountered a null resistance.",
    "Calibration Required: Reality and the code are no longer in sync.",
];

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [randomMessage, setRandomMessage] = useState("Something went wrong!");

    useEffect(() => {
        // detailed log for debugging
        console.error("--- AUTHESCI ERROR BOUNDARY CAUGHT AN ERROR ---");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Digest:", error.digest);
        console.error("Stack Trace:", error.stack);
        console.error("-----------------------------------------------");

        // Pick a random scientific error message
        const randomIndex = Math.floor(Math.random() * SCIENTIFIC_ERRORS.length);
        setRandomMessage(SCIENTIFIC_ERRORS[randomIndex]);
    }, [error]);

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 blur-xl rounded-full" />
                <div className="relative bg-white dark:bg-slate-900 p-6 rounded-full shadow-xl border border-red-100 dark:border-red-900/50">
                    <Beaker className="w-16 h-16 text-red-500 dark:text-red-400 rotate-12 transition-transform hover:rotate-0 duration-500" />
                    <AlertTriangle className="w-8 h-8 text-amber-500 absolute -bottom-2 -right-2 animate-bounce" />
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                Experiment Failed
            </h1>

            <div className="mb-6 max-w-lg">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Diagnostic Report
                </p>
                <p className="text-xl text-slate-700 dark:text-slate-200 font-medium italic">
                    "{randomMessage}"
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-8 max-w-md w-full text-left overflow-hidden">
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
                    Error: {error.message || "Unknown error occurred"}
                </p>
                {error.digest && (
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Digest: {error.digest}
                    </p>
                )}
            </div>

            <div className="flex gap-4">
                <Button
                    onClick={() => window.location.href = '/'} // Hard reload/redirect often better than just reset() if state is corrupted
                    variant="outline"
                    className="gap-2"
                >
                    <WifiOff size={16} />
                    Go Home
                </Button>
                <Button
                    onClick={() => reset()}
                    className="gap-2 bg-gradient-to-r from-blue-600 to-purple-400 hover:from-blue-600 hover:to-purple-400 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                >
                    <RefreshCcw size={16} />
                    Rerun Experiment
                </Button>
            </div>
        </div>
    );
}
