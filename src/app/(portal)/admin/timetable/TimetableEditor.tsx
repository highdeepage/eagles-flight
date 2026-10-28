"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveTimetableEntry } from "@/lib/timetable/actions";
import { Button, Select, Input, useToast } from "@/components/ui";

const DAYS = [1, 2, 3, 4, 5];
const DAY_NAMES = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri" } as Record<number, string>;

export function TimetableEditor({
  arms, periods, subjects, teachers, selectedArm, termId, entries,
}: {
  arms: any[]; periods: any[]; subjects: any[]; teachers: any[];
  selectedArm: string; termId: string; entries: any[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [arm, setArm] = useState(selectedArm);
  const [cell, setCell] = useState<{ period: string; day: number } | null>(null);
  const [pending, setPending] = useState(false);

  const entryFor = (periodId: string, day: number) =>
    entries.find((e) => e.period_id === periodId && e.day_of_week === day);

  const submit = async (formData: FormData) => {
    setPending(true);
    try {
      const res = await saveTimetableEntry(null, formData);
      if (res.ok) { push("success", "Saved."); setCell(null); router.refresh(); }
      else push("error", res.error.message);
    } finally { setPending(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={arm} onChange={(e) => { setArm(e.target.value); router.push(`/admin/timetable?arm=${e.target.value}`); }}>
          {arms.map((a) => <option key={a.id} value={a.id}>{a.classes?.name} — {a.arm_name}</option>)}
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="border p-2 text-left">Period</th>
              {DAYS.map((d) => <th key={d} className="border p-2">{DAY_NAMES[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id}>
                <td className="border p-2 font-medium">{p.label}</td>
                {DAYS.map((d) => {
                  const e = entryFor(p.id, d);
                  const editing = cell?.period === p.id && cell.day === d;
                  return (
                    <td key={d} className="border p-1 align-top">
                      {editing ? (
                        <form action={submit} className="space-y-1">
                          <input type="hidden" name="class_arm_id" value={arm} />
                          <input type="hidden" name="term_id" value={termId} />
                          <input type="hidden" name="period_id" value={p.id} />
                          <input type="hidden" name="day_of_week" value={d} />
                          <select name="subject_id" defaultValue={e?.subject_id ?? ""} className="w-full rounded border px-1 py-0.5 text-xs">
                            <option value="">—</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
                          </select>
                          <select name="staff_id" defaultValue={e?.staff_id ?? ""} className="w-full rounded border px-1 py-0.5 text-xs">
                            <option value="">—</option>
                            {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name ?? t.email}</option>)}
                          </select>
                          <Input name="room" defaultValue={e?.room ?? ""} placeholder="Room" className="!py-0.5 !text-xs" />
                          <div className="flex gap-1">
                            <Button type="submit" size="sm" loading={pending}>Save</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setCell(null)}>Cancel</Button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCell({ period: p.id, day: d })}
                          className="w-full rounded px-1 py-0.5 text-left hover:bg-slate-50"
                        >
                          {e ? (
                            <>
                              <div className="font-medium">{e.subjects?.code ?? "—"}</div>
                              <div className="text-slate-500">{e.users?.full_name ?? ""}</div>
                            </>
                          ) : <span className="text-slate-300">+</span>}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}