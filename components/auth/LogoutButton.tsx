"use client";

import { useTransition } from "react";
import { logout } from "@/app/auth/actions";

const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
      className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50"
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export default LogoutButton
