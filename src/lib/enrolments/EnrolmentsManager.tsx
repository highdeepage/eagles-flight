"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { enrolStudent } from "@/lib/enrolments/actions";
import { Button, Label, Select, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Student { id: string; admission_no: string; surname: string; first_name: string; }
interface Arm { id: string; arm_name: string; classes: { name: string }; }

export function EnrolmentsManager({
  students, arms, termId, sessionId,
}: {
  students: Student[];
  arms: Arm[];
  termId: string;
  sessionId: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [studentId, setStudentId] = useState("");
  const [armId, setArmId] = useState("");

  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(
    enrolStudent,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      push("success", "Student enrolled.");
      setStudentId("");
      setArmId("");
      router.refresh();
    }
    if (state && !state.ok) push("error", state.error.message);
  }, [state, push, router]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="term_id" value={termId} />
      <input type="hidden" name="session_id" value={sessionId} />

      {state && !state.ok && <Alert variant="error">{state.error.message}</Alert>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Student</Label>
          <Select
            name="student_id"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">Choose…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.admission_no} — {s.surname} {s.first_name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Class arm</Label>
          <Select
            name="class_arm_id"
            value={armId}
            onChange={(e) => setArmId(e.target.value)}
            required
          >
            <option value="">Choose…</option>
            {arms.map((a) => (
              <option key={a.id} value={a.id}>
                {a.classes?.name} — {a.arm_name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button type="submit" loading={pending}>Enrol student</Button>
    </form>
  );
}