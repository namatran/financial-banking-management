import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the link from Supabase's default "Confirm your signup" email
 * (and email-change / password-recovery emails, which use the same
 * token_hash mechanism). Supabase's default email template points
 * here with `?token_hash=...&type=signup`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next") ?? "/protected";

  // Apply CodeRabbit's logic here as well!
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/protected";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      redirect(next); // Now this is 100% safe!
    }
  }

  redirect(`${origin}/auth/error`);
}
