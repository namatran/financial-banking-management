import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that do NOT require an authenticated session.
 * Everything else is treated as protected by default — safer for a
 * financial app than an allow-list of protected routes, since a new
 * route is locked down unless you explicitly open it up.
 */
const PUBLIC_ROUTE_PREFIXES = [
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/confirm",
  "/auth/error",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Runs on every request (see root middleware.ts).
 * 1. Refreshes the Supabase auth token if it's expired.
 * 2. Redirects unauthenticated users away from protected routes.
 *
 * This is the ONLY reliable place to keep sessions alive across Server
 * Components, since Server Components can't write cookies themselves.
 */
export async function updateSession(request: NextRequest) {
  // Response we'll mutate and eventually return. Re-created whenever
  // Supabase sets new cookies so the browser receives them.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookies onto both the incoming request (so this same
          // middleware invocation sees them) and the outgoing response.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient() and
  // getUser(). Anything in between can silently break session refresh
  // and cause users to be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    // Preserve the originally requested path so we can send the user
    // back there after a successful login.
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: Always return supabaseResponse (or a copy that preserves
  // its cookies). Returning a fresh NextResponse here would drop the
  // refreshed session cookies and log the user out.
  return supabaseResponse;
}
