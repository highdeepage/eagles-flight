"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useToast } from "./Toast";
import { Pencil, Trash2, X, Check } from "lucide-react";
import type { ActionResult } from "@/lib/errors/handle";

// ── All actions a row editor can trigger, imported client-side ──
import { updateStudent, updateStaff } from "@/lib/people/actions";
import {
  updateParent,
  deleteParent,
  updateArm,
  deleteArm,
  updateSubject,
  deleteSubject,
  updateDepartment,
  deleteDepartment,
  deleteStudent,
  deleteStaff,
} from "@/lib/people/crud-actions";

export type RowAction =
  | "updateStudent"
  | "deleteStudent"
  | "updateStaff"
  | "deleteStaff"
  | "updateParent"
  | "deleteParent"
  | "updateArm"
  | "deleteArm"
  | "updateSubject"
  | "deleteSubject"
  | "updateDepartment"
  | "deleteDepartment";

const UPDATE_ACTIONS: Record<
  string,
  (id: string, prev: ActionResult<null> | null, fd: FormData) => Promise<ActionResult<null>>
> = {
  updateStudent: (id, _prev, fd) => updateStudent(id, _prev, fd),
  updateStaff: (id, _prev, fd) => updateStaff(id, _prev, fd),
  updateParent: (id, _prev, fd) => updateParent(id, _prev, fd),
  updateArm: (id, _prev, fd) => updateArm(id, _prev, fd),
  updateSubject: (id, _prev, fd) => updateSubject(id, _prev, fd),
  updateDepartment: (id, _prev, fd) => updateDepartment(id, _prev, fd),
};

const DELETE_ACTIONS: Record<string, (id: string) => Promise<ActionResult<null>>> = {
  deleteStudent,
  deleteStaff,
  deleteParent,
  deleteArm,
  deleteSubject,
  deleteDepartment,
};

export interface InlineField {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  defaultValue: string | number;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
}

export function InlineRowEditor({
  recordId,
  updateAction,
  deleteAction,
  fields,
  deleteConfirm,
}: {
  recordId: string;
  updateAction: keyof typeof UPDATE_ACTIONS;
  deleteAction?: keyof typeof DELETE_ACTIONS;
  fields: InlineField[];
  deleteConfirm?: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      const res = await UPDATE_ACTIONS[updateAction](recordId, null, fd);
      if (res.ok) {
        push("success", "Saved.");
        setEditing(false);
        router.refresh();
      } else {
        push("error", res.error.message);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteAction) return;
    if (deleteConfirm && !confirm(deleteConfirm)) return;
    start(async () => {
      const res = await DELETE_ACTIONS[deleteAction](recordId);
      if (res.ok) {
        push("success", "Deleted.");
        router.refresh();
      } else {
        push("error", res.error.message);
      }
    });
  };

  if (!editing) {
    return (
      <div className="flex justify-end gap-1">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setEditing(true)}
          icon={<Pencil className="h-3.5 w-3.5" />}
        >
          Edit
        </Button>
        {deleteAction && (
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            disabled={pending}
            icon={<Trash2 className="h-3.5 w-3.5" />}
          >
            Delete
          </Button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-2 rounded-md border border-blue-200 bg-blue-50/40 p-3"
    >
      {fields.map((f) => (
        <div key={f.name}>
          <label className="text-xs font-medium text-slate-600">{f.label}</label>
          {f.type === "select" ? (
            <select
              name={f.name}
              defaultValue={String(f.defaultValue)}
              required={f.required}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              <option value="">—</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.type === "textarea" ? (
            <textarea
              name={f.name}
              defaultValue={String(f.defaultValue)}
              required={f.required}
              rows={2}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            />
          ) : (
            <input
              name={f.name}
              type={f.type ?? "text"}
              defaultValue={String(f.defaultValue)}
              required={f.required}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
            />
          )}
        </div>
      ))}
      <div className="flex gap-1 pt-1">
        <Button
          type="submit"
          size="sm"
          loading={pending}
          icon={<Check className="h-3.5 w-3.5" />}
        >
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
          icon={<X className="h-3.5 w-3.5" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}