"use client";

import { signInWithOAuth } from "@/app/auth/actions";

/**
 * Renders a button per enabled OAuth provider. Calling a Server Action
 * bound with .bind(null, provider) keeps this a plain <form> submit —
 * no client-side Supabase call needed, so the anon key never has to
 * handle the redirect logic itself.
 */
export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <form action={signInWithOAuth.bind(null, "google")}>
        <button
          type="submit"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
        >
          Google
        </button>
      </form>
      <form action={signInWithOAuth.bind(null, "github")}>
        <button
          type="submit"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium transition hover:bg-neutral-50"
        >
          GitHub
        </button>
      </form>
    </div>
  );
}
