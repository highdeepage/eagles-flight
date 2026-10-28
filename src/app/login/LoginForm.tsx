"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/actions";
import { Button, Input, Label, Alert } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

export function LoginForm({
  primaryColor,
  accentColor,
}: {
  primaryColor: string;
  accentColor: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const [state, action, pending] = useActionState<
    ActionResult<{ role: string }> | null,
    FormData
  >(signIn, null);

  useEffect(() => {
    if (state?.ok) {
      const redirect = params.get("redirect");
      if (redirect) router.push(redirect);
      else router.push(`/api/auth/redirect?role=${state.data.role}`);
    }
  }, [state, router, params]);

  const fieldErr = (name: string) =>
    state && !state.ok ? state.error.fieldErrors?.[name] : undefined;

  const generalError =
    state && !state.ok && !state.error.fieldErrors ? state.error.message : null;

  const inactive =
    params.get("error") === "account_inactive"
      ? "Your account is inactive. Contact the administrator."
      : null;

  return (
    <form action={action} className="space-y-4">
      {inactive && <Alert variant="error">{inactive}</Alert>}
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <div>
        <Label htmlFor="email" className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-slate-500" />
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@school.com"
          required
          error={fieldErr("email")}
        />
      </div>

      <div>
        <Label htmlFor="password" className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-slate-500" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            error={fieldErr("password")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        {pending ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Signing in…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 transition group-hover:translate-x-0.5" />
            Sign in
          </>
        )}
      </button>

      <div
        className="mt-2 h-1 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
        }}
        aria-hidden
      />
    </form>
  );
}