"use client";

import { useTransition } from "react";
import { setCurrentSession } from "@/lib/academics/actions";
import { useToast } from "@/components/ui";

export function SetCurrentButton({ id, isCurrent }: { id: string; isCurrent: boolean }) {
  const [pending, start] = useTransition();
  const { push } = useToast();
  if (isCurrent) return null;
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => {
        try { await setCurrentSession(id); push("success", "Session set as current."); }
        catch { push("error", "Failed."); }
      })}
      className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
    >
      {pending ? "…" : "Set current"}
    </button>
  );
}