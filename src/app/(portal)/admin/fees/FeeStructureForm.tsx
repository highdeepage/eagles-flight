"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createFeeStructure } from "@/lib/fees/actions";
import { Button, Input, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function FeeStructureForm() {
  const router = useRouter();
  const { push } = useToast();
  const [state, action, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createFeeStructure, null);

  // Fetch options client-side on mount
  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    fetch("/api/fees/options")
      .then((r) => r.json())
      .then((d) => {
        setTerms(d.terms ?? []);
        setClasses(d.classes ?? []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (state?.ok) {
      push("success", "Fee structure created.");
      router.refresh();
    }
    if (state && !state.ok && !state.error.fieldErrors) {
      push("error", state.error.message);
    }
  }, [state, push, router]);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {state && !state.ok && !state.error.fieldErrors && (
        <div className="sm:col-span-2">
          <Alert variant="error">{state.error.message}</Alert>
        </div>
      )}

      <div>
        <Label>Term</Label>
        <Select
          name="term_id"
          required
          onChange={(e) => {
            const t = terms.find((x) => x.id === e.target.value);
            setSessionId(t?.session_id ?? "");
          }}
        >
          <option value="">Choose term…</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              {t.academic_sessions?.name} — {t.name}
            </option>
          ))}
        </Select>
        <input type="hidden" name="session_id" value={sessionId} />
      </div>

      <div>
        <Label>Class</Label>
        <Select name="class_id" required>
          <option value="">Choose class…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Description</Label>
        <Input name="description" placeholder="e.g. Term 1 tuition" required />
      </div>

      <div>
        <Label>Amount (₦)</Label>
        <Input name="amount" type="number" min={0} step="0.01" required />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" loading={pending} className="w-full">
          Create structure
        </Button>
      </div>
    </form>
  );
}