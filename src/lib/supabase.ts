import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export function createClient() {
  // Check if we're in the browser and have the required env vars
  if (typeof window === 'undefined') {
    // Server-side - return a dummy client that will be replaced on client
    return null as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
    return null as any;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
