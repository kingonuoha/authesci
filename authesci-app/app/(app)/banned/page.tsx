"use client";


import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default function BannedPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // or window.location.href = '/login' for hard redirect
        router.refresh();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8 text-center border border-neutral-200 dark:border-neutral-700">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Account Suspended</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    Your account has been suspended due to a violation of our terms of service or policies.
                    If you believe this is a mistake, please contact support.
                </p>
                <div className="flex flex-col gap-3">
                    <Button variant="outline" onClick={() => window.location.href = 'mailto:support@authesci.com'}>
                        Contact Support
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
