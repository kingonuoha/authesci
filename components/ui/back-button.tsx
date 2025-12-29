"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    label?: string;
    className?: string;
    fallbackUrl?: string;
}

export function BackButton({ label = "Back", className, fallbackUrl }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else if (fallbackUrl) {
            router.push(fallbackUrl);
        } else {
            router.back();
        }
    };

    return (
        <button
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors ${className || ""}`}
        >
            <ArrowLeft className="w-4 h-4" /> {label}
        </button>
    );
}
