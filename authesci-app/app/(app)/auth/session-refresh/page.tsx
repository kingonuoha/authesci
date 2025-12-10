import { createClient } from '@/lib/supabase/server';
import ClientRedirector from '@/components/modules/auth/ClientRedirector';

export const dynamic = 'force-dynamic';

export default async function SessionRefreshPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let redirectUrl = '/login?error=session_error'; // Default to login with error

  if (user) {
    const role = user.app_metadata.role as string | undefined;
    if (role) {
      redirectUrl = `/${role.toLowerCase()}/dashboard`;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <p className="text-lg text-gray-700">Refreshing session and redirecting...</p>
      <ClientRedirector redirectUrl={redirectUrl} />
    </div>
  );
}
