import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import "./(app)/globals.css";

export const metadata: Metadata = {
    title: "404 - Page Not Found | Authesci",
    description: "The page you are looking for does not exist."
};

export default function NotFound() {
    return (
        <html lang="en">
            <body className="flex min-h-screen flex-col items-center justify-center bg-background text-center font-sans">
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-9xl font-extrabold tracking-widest text-primary">404</h1>
                    <div className="bg-primary px-2 text-sm text-primary-foreground rounded rotate-12 absolute">
                        Page Not Found
                    </div>
                    <h2 className="mt-8 text-2xl font-bold md:text-3xl">Sorry, we couldn't find that page.</h2>
                    <p className="mt-4 max-w-md text-muted-foreground">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                    <Button asChild className="mt-8" size="lg">
                        <Link href="/">Go Back Home</Link>
                    </Button>
                </div>
            </body>
        </html>
    );
}
