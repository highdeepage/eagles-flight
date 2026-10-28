"use client";

import { useActionState, useEffect, useState } from "react";
import { saveAttendance } from "@/lib/attendance/actions";
import {
  listStudentsInArm,
  attendanceForDate,
  type AttendanceStudent,
} from "@/lib/attendance/client-queries";
import { Button, Label, Select, Input, Alert, useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/errors/handle";

interface Arm {
  id: string;
  arm_name: string;
  classes: { name: string } | null;
}

export function AttendanceRegister({
  arms,
  initialArm,
  initialDate,
}: {
  arms: Arm[];
  initialArm?: string;
  initialDate?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [armId, setArmId] = useState(initialArm ?? "");
  const [date, setDate] = useState(initialDate ?? today);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [formStatus, setFormStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!armId) {
      setStudents([]);
      setFormStatus({});
      return;
    }
    setLoading(true);
    Promise.all([listStudentsInArm(armId), attendanceForDate(armId, date)])
      .then(([list, att]) => {
        setStudents(list);
        const saved: Record<string, string> = {};
        for (const a of att) saved[a.student_id] = a.status;
        const init: Record<string, string> = {};
        for (const s of list) init[s.id] = saved[s.id] ?? "present";
        setFormStatus(init);
      })
      .finally(() => setLoading(false));
  }, [armId, date]);

  const [state, action, pending] = useActionState<ActionResult<null> | null, FormData>(
    async () => {
      const records = students.map((s) => ({
        student_id: s.id,
        status: formStatus[s.id] ?? "present",
      }));
      return saveAttendance({ armId, date, records });
    },
    null,
  );

  useEffect(() => {
    if (state?.ok) push("success", "Attendance saved.");
    if (state && !state.ok) push("error", state.error.message);
  }, [state, push]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Class arm</Label>
          <Select value={armId} onChange={(e) => setArmId(e.target.value)}>
            <option value="">Choose…</option>
            {arms.map((a) => (
              <option key={a.id} value={a.id}>
                {a.classes?.name ?? "—"} — {a.arm_name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {state && !state.ok && <Alert variant="error">{state.error.message}</Alert>}

      {armId &&
        (loading ? (
          <p className="text-sm text-slate-500">Loading students…</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-500">
            No students enrolled in this arm yet. Enrol students in Phase 5 first.
          </p>
        ) : (
          <form action={action} className="space-y-3">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Student</th>
                  <th className="py-2">Admission</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2">
                      {s.surname}, {s.first_name} {s.other_names ?? ""}
                    </td>
                    <td className="py-2 font-mono text-xs">{s.admission_no}</td>
                    <td className="py-2">
                      <select
                        value={formStatus[s.id] ?? "present"}
                        onChange={(e) =>
                          setFormStatus((p) => ({ ...p, [s.id]: e.target.value }))
                        }
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button type="submit" loading={pending}>
              Save attendance
            </Button>
          </form>
        ))}
    </div>
  );
}