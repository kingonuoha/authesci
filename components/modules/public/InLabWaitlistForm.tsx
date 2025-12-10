"use client";

import { useState } from "react";
import { subscribeToWaitlist } from "@/app/actions/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function InLabWaitlistForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await subscribeToWaitlist(formData);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            // Optional: Reset form or show success state
            const form = document.getElementById("waitlist-form") as HTMLFormElement;
            if (form) form.reset();
        }
    }

    return (
        <form id="waitlist-form" action={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mt-8">
            <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                className="flex-1"
                disabled={loading}
            />
            <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Notify Me
            </Button>
        </form>
    );
}
