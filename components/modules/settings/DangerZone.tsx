"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Lock, Trash2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { initiateFactoryReset, confirmFactoryReset } from "@/app/(app)/actions/system";
import { useRouter } from "next/navigation";

const QUOTES = [
    "Cleaning up the mess...",
    "Rebooting the system...",
    "Deleting memories...",
    "Formatting disks...",
    "A clean slate is a happy slate.",
    "Almost there...",
    "Making space for greatness..."
];

export function DangerZone() {
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [verificationCode, setVerificationCode] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingQuote, setLoadingQuote] = useState(QUOTES[0]);
    const router = useRouter();

    // Rotate quotes during loading
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleInitiate = async () => {
        // Step 1 -> 2
        setIsLoading(true);
        try {
            // Ideally we ask for password here, but as discussed we'll use Email Code as primary verification
            const res = await initiateFactoryReset("placeholder-password");
            if (res.success) {
                toast.success(res.message);
                setStep(2);
            } else {
                toast.error(res.error || "Failed to initiate reset");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (confirmText !== "reset authesci") {
            toast.error("Please type the confirmation text exactly.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await confirmFactoryReset(verificationCode, confirmText);
            if (res.success) {
                toast.success(res.message);
                // Redirect or refresh
                router.refresh();
                setStep(0);
            } else {
                toast.error(res.error || "Reset failed");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 animate-in fade-in">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Factory Reset in Progress</h3>
                <p className="text-neutral-500 italic">"{loadingQuote}"</p>
                <p className="text-sm text-red-500 mt-4">Do not close this window.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Factory Reset</h3>
                        <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl">
                            This action will permanently delete all data in the application, including jobs, applications, projects, messages, and users (except the current Admin).
                            <strong> This cannot be undone.</strong>
                        </p>

                        {step === 0 && (
                            <Button variant="destructive" onClick={() => setStep(1)} className="mt-4">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Reset System
                            </Button>
                        )}
                    </div>
                </div>

                {step === 1 && (
                    <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-900/30 animate-in slide-in-from-top-2">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3">Are you absolutely sure?</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            You are about to wipe the entire database. This is a destructive action intended for development or system reboot purposes only.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(0)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleInitiate}>
                                I understand the risks, send me the code
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-900/30 animate-in slide-in-from-top-2 space-y-4 max-w-md">
                        <h4 className="font-semibold text-red-800 dark:text-red-300">Final Verification</h4>

                        <div>
                            <label className="block text-sm font-medium mb-1">Verification Code</label>
                            <p className="text-xs text-neutral-500 mb-2">Check your email/logs for the 6-digit code.</p>
                            <Input
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="000000"
                                className="font-mono text-center tracking-widest text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Type "reset authesci" to confirm</label>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="reset authesci"
                                className="border-red-300 focus:border-red-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setStep(0)} className="w-full">Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirm}
                                disabled={verificationCode.length < 6 || confirmText !== "reset authesci"}
                                className="w-full"
                            >
                                Confirm Reset
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
