"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { uploadLogo } from "@/lib/media/upload-logo";
import { Button, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function LogoUploader({ currentUrl }: { currentUrl: string | null }) {
  const [state, action, pending] = useActionState<ActionResult<{ url: string }> | null, FormData>(uploadLogo, null);
  const { push } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) { push("success", "Logo updated."); formRef.current?.reset(); }
    if (state && !state.ok) push("error", state.error.message);
  }, [state, push]);

  const url = state?.ok ? state.data.url : currentUrl;

  return (
    <div className="flex items-center gap-6">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="School logo" className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-slate-400">No logo</span>
        )}
      </div>
      <form ref={formRef} action={action} className="flex-1 space-y-2">
        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm hover:file:bg-slate-50"
        />
        <Button type="submit" size="sm" loading={pending}>Upload logo</Button>
        {state && !state.ok && <Alert variant="error">{state.error.message}</Alert>}
      </form>
    </div>
  );
}