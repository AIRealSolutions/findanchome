import { createClient } from '@supabase/supabase-js';

// Cookie-less client for public, cacheable reads (listings, sitemap).
// Returns null when env vars are missing so builds and previews still work.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
