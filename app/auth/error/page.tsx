import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Your sign-in link may have expired or already been used. Try signing
        in again.
      </p>
      <Link
        href="/auth/login"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Back to sign in
      </Link>
    </div>
  );
}
