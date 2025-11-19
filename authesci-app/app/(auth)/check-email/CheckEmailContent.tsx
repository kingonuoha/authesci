'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-1 p-4">
      <div className="bg-white dark:bg-dark-2 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">Check Your Email</h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          A password reset link has been sent to <span className="font-semibold text-primary-600">{email || 'your email address'}</span>.
          Please check your inbox (and spam folder) to reset your password.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          If you don't receive the email within a few minutes, please check your spam folder or try again.
        </p>
        <Link href="/forgot-password" className="text-primary-600 font-semibold hover:underline">
          Resend Password Reset Email
        </Link>
      </div>
    </div>
  );
}
