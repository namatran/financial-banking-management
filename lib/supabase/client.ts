import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the BROWSER (Client Components).
 * Reads/writes the session via browser cookies/localStorage automatically.
 *
 * Create a new instance per call site rather than a shared singleton —
 * @supabase/ssr is designed to be cheap to instantiate and this avoids
 * stale-closure bugs with cookies during navigation.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
