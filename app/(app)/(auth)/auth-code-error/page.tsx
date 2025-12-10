import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-1 p-4">
      <div className="bg-white dark:bg-dark-2 p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-danger-500 mb-4">Authentication Error</h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">
          There was an issue with your authentication link. This could be due to an expired or invalid link.
          Please try signing in again or requesting a new verification/reset link.
        </p>
        <Link href="/login" className="text-primary-600 font-semibold hover:underline mr-4">
          Go to Login
        </Link>
        <Link href="/signup" className="text-primary-600 font-semibold hover:underline">
          Go to Sign Up
        </Link>
      </div>
    </div>
  );
}
