"use client";

import { useActionState, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTeacherLogin, deactivateStaffLogin } from "../actions";
import { Button, Input, Label, Select, Alert, Card, CardBody, CardHeader, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Props {
  staff: any;
  existingUser: { email: string; role: string; is_active: boolean } | null;
}

export function StaffLoginCard({ staff, existingUser }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(!existingUser);
  const [pendingDeactivate, startDeactivate] = useTransition();

  const [state, action, pending] = useActionState<ActionResult<{ userId: string }> | null, FormData>(
    createTeacherLogin,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      push("success", "Teacher login created.");
      setShowForm(false);
      router.refresh();
    }
    if (state && !state.ok && !state.error.fieldErrors) push("error", state.error.message);
  }, [state, push, router]);

  const err = (k: string) => (state && !state.ok ? state.error.fieldErrors?.[k] : undefined);

  if (existingUser) {
    return (
      <Card>
        <CardHeader title="Teacher login" description="This staff member can sign in to the teacher portal" />
        <CardBody className="space-y-3">
          <div className="text-sm">
            <div className="text-slate-600">Email</div>
            <div className="font-medium text-slate-900">{existingUser.email}</div>
          </div>
          <div className="text-sm">
            <div className="text-slate-600">Role</div>
            <div className="font-medium capitalize text-slate-900">{existingUser.role.replace("_", " ")}</div>
          </div>
          <div className="text-sm">
            <div className="text-slate-600">Status</div>
            <div className={`inline-flex rounded px-2 py-0.5 text-xs ${existingUser.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {existingUser.is_active ? "Active" : "Inactive"}
            </div>
          </div>
          {existingUser.is_active && (
            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                loading={pendingDeactivate}
                onClick={() => startDeactivate(async () => {
                  try { await deactivateStaffLogin(staff.id); push("success", "Login deactivated."); router.refresh(); }
                  catch { push("error", "Failed."); }
                })}
              >
                Deactivate login
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  if (!showForm) return null;

  const suggestedEmail = staff.email || `${staff.first_name.toLowerCase()}.${staff.surname.toLowerCase()}@school.local`;
  const suggestedName = `${staff.first_name} ${staff.surname}`;

  return (
    <Card>
      <CardHeader
        title="Create teacher login"
        description="Give this staff member access to the teacher portal"
      />
      <CardBody>
        <form action={action} className="space-y-3">
          <input type="hidden" name="staff_id" value={staff.id} />
          <input type="hidden" name="full_name" value={suggestedName} />

          {state && !state.ok && !state.error.fieldErrors && (
            <Alert variant="error">{state.error.message}</Alert>
          )}

          <div>
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={suggestedEmail} required error={err("email")} />
          </div>
          <div>
            <Label>Role</Label>
            <Select name="role" defaultValue="teacher" required>
              <option value="teacher">Teacher</option>
              <option value="class_teacher">Class Teacher</option>
            </Select>
          </div>
          <div>
            <Label>Temporary password</Label>
            <Input name="password" type="text" defaultValue="ChangeMe!2025" required error={err("password")} />
            <p className="mt-1 text-xs text-slate-500">
              Share this password with the teacher. They should change it on first login.
            </p>
          </div>
          <Button type="submit" loading={pending}>Create login</Button>
        </form>
      </CardBody>
    </Card>
  );
}