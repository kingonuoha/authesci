"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Mail } from 'lucide-react';

function VerifiedEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 p-4">
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 text-center max-w-md w-full">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600 dark:text-primary-400">
                    <Mail className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Check your inbox</h2>

                <p className="text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                    We've sent a verification link to <br />
                    <span className="font-semibold text-neutral-900 dark:text-white">{email || "your email address"}</span>
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 mb-6 text-sm text-neutral-500 dark:text-neutral-400 text-left">
                    <p className="mb-2"><strong>Next steps:</strong></p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Click the link in the email to verify your account</li>
                        <li>You will be redirected back to sign in</li>
                    </ul>
                </div>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                    Didn't receive the email? Check your spam folder or try signing up again.
                </p>

                <Link href="/login" className="btn btn-primary w-full py-3 rounded-xl flex items-center justify-center">
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}

export default function VerifiedEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifiedEmailContent />
        </Suspense>
    );
}
