"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createParentLogin, deactivateParentLogin } from "./actions";
import {
  Button,
  Input,
  Label,
  Alert,
  Card,
  CardBody,
  CardHeader,
  useToast,
} from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";
import { KeyRound, Mail, Lock, ShieldOff } from "lucide-react";

export function ParentLoginCard({
  parent,
  existingUser,
}: {
  parent: { id: string; first_name: string; surname: string; email: string | null };
  existingUser: { email: string; is_active: boolean } | null;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pendingDeactivate, startDeactivate] = useTransition();

  const [state, action, pending] = useActionState<
    ActionResult<{ userId: string }> | null,
    FormData
  >(createParentLogin, null);

  useEffect(() => {
    if (state?.ok) {
      push("success", "Parent login created.");
      router.refresh();
    }
    if (state && !state.ok && !state.error.fieldErrors) {
      push("error", state.error.message);
    }
  }, [state, push, router]);

  const err = (k: string) =>
    state && !state.ok ? state.error.fieldErrors?.[k] : undefined;

  const suggestedEmail =
    parent.email ||
    `${parent.first_name.toLowerCase()}.${parent.surname.toLowerCase()}@parent.local`;

  if (existingUser) {
    return (
      <Card>
        <CardHeader
          title="Parent login"
          description="This parent can sign in to the parent portal"
          icon={<KeyRound className="h-4 w-4" />}
        />
        <CardBody className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500" />
            <span className="text-slate-600">Email:</span>
            <span className="font-medium text-slate-900">{existingUser.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Status:</span>
            <span
              className={`rounded px-2 py-0.5 text-xs ${
                existingUser.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {existingUser.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          {existingUser.is_active && (
            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                loading={pendingDeactivate}
                icon={<ShieldOff className="h-3.5 w-3.5" />}
                onClick={() =>
                  startDeactivate(async () => {
                    const res = await deactivateParentLogin(parent.id);
                    if (res.ok) {
                      push("success", "Login deactivated.");
                      router.refresh();
                    } else {
                      push("error", res.error.message);
                    }
                  })
                }
              >
                Deactivate login
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Create parent login"
        description="Give this parent access to their portal"
        icon={<KeyRound className="h-4 w-4" />}
      />
      <CardBody>
        <form action={action} className="space-y-3">
          <input type="hidden" name="parent_id" value={parent.id} />

          {state && !state.ok && !state.error.fieldErrors && (
            <Alert variant="error">{state.error.message}</Alert>
          )}

          <div>
            <Label htmlFor="par_email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              Email
            </Label>
            <Input
              id="par_email"
              name="email"
              type="email"
              defaultValue={suggestedEmail}
              required
              error={err("email")}
            />
          </div>

          <div>
            <Label htmlFor="par_password" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              Temporary password
            </Label>
            <Input
              id="par_password"
              name="password"
              type="text"
              defaultValue="ChangeMe!2025"
              required
              error={err("password")}
            />
            <p className="mt-1 text-xs text-slate-500">
              Share this with the parent. They should change it on first login.
            </p>
          </div>

          <Button
            type="submit"
            loading={pending}
            icon={<KeyRound className="h-4 w-4" />}
          >
            Create login
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}