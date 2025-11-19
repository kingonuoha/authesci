// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

// This client is intended for server-side use ONLY, for operations that
// require administrative privileges, such as modifying user app_metadata.
// It uses the SERVICE_ROLE_KEY, which should NEVER be exposed to the client.

// Ensure the environment variables are not undefined.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
