import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use on the SERVER (Server Components, Server Actions,
 * Route Handlers). Reads the session from the request's cookies.
 *
 * NOTE: This must be called fresh in every function that needs it — the
 * cookie store is tied to the current request and cannot be cached/reused
 * across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` was called from a Server Component, which can't set
            // cookies directly. Safe to ignore here because our middleware
            // (see middleware.ts) refreshes the session on every request.
          }
        },
      },
    }
  );
}
