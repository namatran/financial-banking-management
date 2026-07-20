"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

if (!SITE_URL) {
  throw new Error("CRITICAL CONFIGURATION ERROR: NEXT_PUBLIC_SITE_URL environment variable is missing.");
}

/**
 * Shape returned to the client on failure so forms can render an
 * inline error instead of relying on a thrown exception.
 */
type ActionResult = { error: string } | void;

/**
 * Email + password sign in.
 * Reads FormData directly — no client-side validation library needed
 * for the basics, but you should still validate with Zod for anything
 * more complex than "these fields are present".
 */
export async function login(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const requestedRedirect = String(formData.get("redirectTo") ?? "/protected");
  
  // CodeRabbit's Fix: Safe same-origin relative path check
  const redirectTo =
    requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/protected";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Revalidate anything that reads auth state (e.g. navbar showing
  // logged-in status) before navigating away.
  revalidatePath("/", "layout");
  redirect(redirectTo);
}
 * Supabase sends a confirmation email by default (configurable in
 * Dashboard > Authentication > Providers > Email). The user isn't
 * fully authenticated until they click the link and hit /auth/confirm.
 */
export async function signup(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Stashed in auth.users.raw_user_meta_data — the profiles trigger
      // (see supabase/migrations/..._profiles.sql) reads this to seed
      // the profiles row automatically.
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/signup?check-email=1");
}

/**
 * Passwordless sign in via a magic link emailed to the user.
 * Uses `shouldCreateUser: true` so this form doubles as sign-up —
 * remove that if you want magic link to be login-only.
 */
export async function signInWithMagicLink(
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/auth/login?check-email=1");
}

/**
 * OAuth sign in (Google, GitHub, etc).
 * Requires the provider to be enabled and configured with a Client
 * ID/Secret in Supabase Dashboard > Authentication > Providers.
 */
export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/auth/error");
  }

  // Supabase returns the provider's consent-screen URL — send the
  // browser there directly.
  redirect(data.url);
}

/**
 * Signs the user out and clears the session cookie.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
