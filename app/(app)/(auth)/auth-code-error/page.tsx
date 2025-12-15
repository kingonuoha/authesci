import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-8 lg:p-10 w-full animate-in fade-in zoom-in duration-500">
      <div className="mb-8 text-center">
        <h4 className="mb-2 text-2xl font-bold text-red-600 drop-shadow-sm">Authentication Error</h4>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium drop-shadow-sm">
          There was an issue with your authentication link.
        </p>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          This could be due to an expired or invalid link. Please try signing in again or requesting a new verification/reset link.
        </p>

        <div className="flex bg-white/30 rounded-xl p-2 justify-center gap-4 mt-6">
          <Link href="/login" className="text-primary-700 dark:text-primary-400 font-bold hover:underline px-4 py-2">
            Go to Login
          </Link>
          <span className="text-gray-400 py-2">|</span>
          <Link href="/signup" className="text-primary-700 dark:text-primary-400 font-bold hover:underline px-4 py-2">
            Go to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
