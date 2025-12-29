"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Radiation, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { initiateFactoryReset, confirmFactoryReset, type ResetMode } from "@/app/(app)/actions/system";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const QUOTES = [
    "Cleaning up the mess...",
    "Rebooting the system...",
    "Deleting memories...",
    "Formatting disks...",
    "A clean slate is a happy slate.",
    "Almost there...",
    "Making space for greatness..."
];

const NUCLEAR_QUOTES = [
    "Preparing the launch codes...",
    "Targeting database clusters...",
    "Scorched earth protocol initiated...",
    "Mutually Assured Destruction in progress...",
    "See you on the other side...",
    "Silence will fall..."
];

export function DangerZone() {
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [mode, setMode] = useState<ResetMode>("standard");
    const [verificationCode, setVerificationCode] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingQuote, setLoadingQuote] = useState(QUOTES[0]);
    const router = useRouter();

    // Rotate quotes during loading
    useEffect(() => {
        if (isLoading) {
            const quoteList = mode === "nuclear" ? NUCLEAR_QUOTES : QUOTES;
            const interval = setInterval(() => {
                setLoadingQuote(quoteList[Math.floor(Math.random() * quoteList.length)]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading, mode]);

    const handleInitiate = async () => {
        // Step 1 -> 2
        setIsLoading(true);
        try {
            // Ideally we ask for password here, but as discussed we'll use Email Code as primary verification
            const res = await initiateFactoryReset("placeholder-password", mode);
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
        const requiredText = mode === "nuclear" ? "nuke everything" : "reset authesci";

        if (confirmText !== requiredText) {
            toast.error(`Please type the confirmation text exactly: "${requiredText}"`);
            return;
        }

        setIsLoading(true);
        try {
            const res = await confirmFactoryReset(verificationCode, confirmText, mode);
            if (res.success) {
                toast.success(res.message);
                // Redirect or refresh
                router.refresh();
                setStep(0);
            } else {
                toast.error(res.error || "Reset failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 animate-in fade-in">
                <div className={cn(
                    "w-16 h-16 border-4 border-t-transparent rounded-full animate-spin",
                    mode === "nuclear" ? "border-warning-500" : "border-red-500"
                )}></div>
                <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    {mode === "nuclear" ? "☢️ Nuclear Event in Progress" : "Factory Reset in Progress"}
                </h3>
                <p className="text-neutral-500 italic">"{loadingQuote}"</p>
                <p className="text-sm text-red-500 mt-4">Do not close this window. There is no turning back.</p>
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
                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Danger Zone</h3>
                        <p className="text-neutral-600 dark:text-neutral-300">
                            Perform a system wipe. This action is irreversible. All selected data will be permanently removed.
                        </p>

                        {step === 0 && (
                            <Button variant="destructive" onClick={() => setStep(1)} className="mt-4">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Initiate Reset Sequence
                            </Button>
                        )}
                    </div>
                </div>

                {step === 1 && (
                    <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-900/30 animate-in slide-in-from-top-2">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4">Choose your weapon</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Standard Option */}
                            <div
                                onClick={() => setMode("standard")}
                                className={cn(
                                    "cursor-pointer border-2 rounded-xl p-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                                    mode === "standard"
                                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                        : "border-transparent bg-white dark:bg-neutral-900"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                    <h5 className="font-bold text-neutral-900 dark:text-neutral-100">Standard Reset</h5>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                    Wipes all user data (Jobs, Applications, Messages).
                                </p>
                                <ul className="text-xs text-neutral-400 list-disc ml-4 space-y-1">
                                    <li>Deletes all User Profiles</li>
                                    <li>Deletes all Jobs & Projects</li>
                                    <li className="text-green-600 font-medium">Keep FAQs & Analytics</li>
                                    <li className="text-green-600 font-medium">Keep Subscribers</li>
                                </ul>
                            </div>

                            {/* Nuclear Option */}
                            <div
                                onClick={() => setMode("nuclear")}
                                className={cn(
                                    "cursor-pointer border-2 rounded-xl p-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/50 relative overflow-hidden",
                                    mode === "nuclear"
                                        ? "border-warning-500 bg-warning-50 dark:bg-warning-950/20"
                                        : "border-transparent bg-white dark:bg-neutral-900"
                                )}
                            >
                                {mode === "nuclear" && (
                                    <div className="absolute top-0 right-0 p-1 bg-warning-500 text-white text-[10px] font-bold rounded-bl">CHOSEN</div>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                    <Radiation className="w-5 h-5 text-warning-500 animate-pulse" />
                                    <h5 className="font-bold text-neutral-900 dark:text-neutral-100">The Nuclear Option</h5>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                    Scorched earth protocol. Nothing survives.
                                </p>
                                <ul className="text-xs text-neutral-400 list-disc ml-4 space-y-1">
                                    <li className="text-red-500 font-medium">Deletes EVERYTHING</li>
                                    <li>Includes FAQs & Help Docs</li>
                                    <li>Includes All Analytics</li>
                                    <li>Includes Subscribers</li>
                                    <li className="italic">Only YOU remain</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep(0)}>Abort Mission</Button>
                            <Button
                                variant={mode === "nuclear" ? "default" : "destructive"}
                                className={mode === "nuclear" ? "bg-warning-600 hover:bg-warning-700 text-white" : ""}
                                onClick={handleInitiate}
                            >
                                {mode === "nuclear" ? "☢️ Launch Nuke Codes" : "Send Reset Code"}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="mt-6 pt-6 border-t border-red-200 dark:border-red-900/30 animate-in slide-in-from-top-2 space-y-4 max-w-md">
                        <h4 className="font-semibold text-red-800 dark:text-red-300">
                            {mode === "nuclear" ? "☢️ Final Launch Authorization" : "Final Verification"}
                        </h4>

                        <div className={cn("p-3 rounded-lg text-sm mb-2", mode === "nuclear" ? "bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200" : "bg-neutral-100 text-neutral-600")}>
                            <Info className="w-4 h-4 inline mr-2" />
                            {mode === "nuclear"
                                ? "You are authorizing a NUCLEAR RESET. Subscriptions, FAQs, and Analytics will be destroyed."
                                : "You are authorizing a Standard Reset. Platform assets are safe."}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Verification Code</label>
                            <Input
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="000000"
                                className="font-mono text-center tracking-widest text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Type <span className="font-mono font-bold text-red-600">"{mode === "nuclear" ? "nuke everything" : "reset authesci"}"</span> to confirm
                            </label>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={mode === "nuclear" ? "nuke everything" : "reset authesci"}
                                className={cn(
                                    "border-red-300 focus:border-red-500",
                                    mode === "nuclear" && "border-warning-300 focus:border-warning-500 focus:ring-warning-500"
                                )}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={() => setStep(0)} className="w-full">Abort</Button>
                            <Button
                                variant={mode === "nuclear" ? "default" : "destructive"}
                                className={mode === "nuclear" ? "bg-warning-600 hover:bg-warning-700 w-full" : "w-full"}
                                onClick={handleConfirm}
                                disabled={verificationCode.length < 6 || confirmText !== (mode === "nuclear" ? "nuke everything" : "reset authesci")}
                            >
                                {mode === "nuclear" ? "☢️ EXECUTE" : "Reset Now"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
