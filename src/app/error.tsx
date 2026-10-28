"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL ERROR]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          An unexpected error occurred. You can try again or go back to the home page.
        </p>

        <details className="mt-4 rounded bg-slate-50 p-3 text-xs text-slate-700">
          <summary className="cursor-pointer font-medium text-slate-900">
            Technical details
          </summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap break-all">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>

        <div className="mt-6 flex gap-2">
          <button
            onClick={reset}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}