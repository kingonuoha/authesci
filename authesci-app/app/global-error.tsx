"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="flex min-h-screen flex-col items-center justify-center text-center">
                <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
                <p className="text-muted-foreground mb-8">A critical error occurred. Please try again.</p>
                <Button onClick={() => reset()}>Try again</Button>
            </body>
        </html>
    );
}
