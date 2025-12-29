'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  if (email) {
    return (
      <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">
        <div className="mb-8 text-center">
          <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Verify Your Email</h4>
          <p className="text-gray-700 dark:text-gray-200 text-lg font-medium drop-shadow-sm">
            A verification link has been sent to <span className="font-semibold text-primary-700 dark:text-primary-400">{email}</span>.
          </p>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please check your inbox (and spam folder) to verify your account. If you don't receive the email within a few minutes, please check your spam folder or try signing up again.
          </p>
          <div className="pt-4">
            <Link href="/signup" className="text-primary-700 dark:text-primary-400 font-bold hover:underline">
              Resend Verification Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no email is provided in the query params
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center">
        <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Email Verification</h4>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium drop-shadow-sm">
          Please check your email for a verification link.
        </p>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          If you have not received one, please sign up again.
        </p>
        <div className="pt-4">
          <Link href="/signup" className="text-primary-700 dark:text-primary-400 font-bold hover:underline">
            Go to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
