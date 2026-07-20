import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/LogoutButton";

/**
 * Layout for every route under /protected.
 *
 * The middleware (lib/supabase/middleware.ts) already redirects
 * unauthenticated requests before they reach here — this second check
 * is deliberate defense-in-depth: middleware matchers can be
 * misconfigured or skipped (e.g. for static files), so any page that
 * touches sensitive data should verify the session itself too.
 *
 * IMPORTANT: Use getUser(), never getSession(), for authorization
 * decisions. getSession() reads the JWT from cookies without
 * revalidating it against Supabase; getUser() round-trips to the
 * Supabase Auth server and can't be spoofed by a tampered cookie.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <span className="text-sm text-neutral-500">{user.email}</span>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
