import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the redirect back from OAuth providers (Google, GitHub, ...)
 * and PKCE-flow magic links. Supabase appends a `code` query param;
 * we exchange it for a session and set the auth cookies.
 *
 * This is DIFFERENT from /auth/confirm, which handles the classic
 * email `token_hash` confirmation flow for signup/email-change.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Where to send the user after a successful exchange.
  const next = searchParams.get("next") ?? "/protected";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Missing code or exchange failed — send to a dedicated error page
  // rather than silently redirecting to login, so the failure is visible.
  return NextResponse.redirect(`${origin}/auth/error`);
}
