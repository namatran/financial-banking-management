"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, signInWithMagicLink } from "@/app/auth/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/protected";
  const checkEmail = searchParams.get("check-email") === "1";

  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"password" | "magic-link">("password");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === "password" ? login : signInWithMagicLink;
      const result = await action(formData);
      // Server Actions only return here on failure — success paths
      // call redirect(), which throws internally and never reaches us.
      if (result?.error) setError(result.error);
    });
  }

  if (checkEmail) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
        Check your inbox for a sign-in link.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
      </div>

      {mode === "password" && (
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending
          ? "Please wait…"
          : mode === "password"
            ? "Sign in"
            : "Send magic link"}
      </button>

      <button
        type="button"
        onClick={() =>
          setMode((m) => (m === "password" ? "magic-link" : "password"))
        }
        className="w-full text-center text-sm text-neutral-500 underline-offset-2 hover:underline"
      >
        {mode === "password"
          ? "Sign in with a magic link instead"
          : "Sign in with a password instead"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-neutral-900 underline-offset-2 hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
