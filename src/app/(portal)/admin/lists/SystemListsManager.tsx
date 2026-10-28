"use client";

import { useActionState, useEffect } from "react";
import { addListItem, toggleListItem } from "./actions";
import { Button, Input, Label, Card, CardBody, CardHeader, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

export function SystemListsManager({ grouped }: { grouped: Record<string, any[]> }) {
  const keys = Object.keys(grouped).sort();
  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(addListItem, null);
  const { push } = useToast();

  useEffect(() => {
    if (state?.ok) push("success", "Item added.");
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Add an item" description="Adds to an existing list. Use lowercase keys." />
        <CardBody>
          <form action={action} className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label htmlFor="list_key">List</Label>
              <Select id="list_key" name="list_key" required>
                <option value="">Choose…</option>
                {keys.map((k) => <option key={k} value={k}>{k}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="item_key">Key</Label>
              <Input id="item_key" name="item_key" placeholder="e.g. remote" required />
            </div>
            <div>
              <Label htmlFor="item_label">Label</Label>
              <Input id="item_label" name="item_label" placeholder="e.g. Remote" required />
            </div>
            <div className="flex items-end">
              <Button type="submit" loading={pending} className="w-full">Add</Button>
            </div>
          </form>
          {state && !state.ok && !state.error.fieldErrors && <Alert variant="error">{state.error.message}</Alert>}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {keys.map((k) => (
          <Card key={k}>
            <CardHeader title={k} description={`${grouped[k].length} items`} />
            <CardBody className="space-y-2">
              {grouped[k].map((it) => (
                <div key={it.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                  <div>
                    <span className="font-mono text-xs text-slate-500">{it.item_key}</span>
                    <span className="ml-2 text-slate-900">{it.item_label}</span>
                    {it.is_system && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">system</span>}
                  </div>
                  <button
                    type="button"
                    onClick={async () => { await toggleListItem(it.id, !it.is_active); push("success", "Updated."); }}
                    className={`rounded px-2 py-1 text-xs ${it.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {it.is_active ? "Active" : "Inactive"}
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}