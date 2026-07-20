import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

const LoginPage = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>

      <OAuthButtons />

      <div className="my-6 flex items-center gap-3 text-xs uppercase text-neutral-400">
        <div className="h-px flex-1 bg-neutral-200" />
        or
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* useSearchParams requires a Suspense boundary in the App Router */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

export default LoginPage;