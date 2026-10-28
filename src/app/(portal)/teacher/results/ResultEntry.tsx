"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveScores, submitScores } from "@/lib/results/actions";
import { Button, Input, useToast } from "@/components/ui";
import { computeSubjectTotal } from "@/lib/results/calc";

interface Component { id: string; name: string; weight: number; }
interface StudentRow {
  enrolment_id: string;
  student: { id: string; admission_no: string; surname: string; first_name: string };
  scores: Record<string, number | null>;
}
interface Group {
  subject_id: string;
  subject: { name: string; code: string };
  class_arm_id: string;
  components: Component[];
  students: StudentRow[];
}

export function ResultEntry({ group, termId }: { group: Group; termId: string }) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  // Local form state per student → component
  const [state, setState] = useState(() => {
    const init: Record<string, Record<string, string>> = {};
    for (const s of group.students) {
      init[s.enrolment_id] = {};
      for (const c of group.components) {
        init[s.enrolment_id]![c.id] = s.scores[c.id]?.toString() ?? "";
      }
    }
    return init;
  });

  const update = (enrolId: string, compId: string, val: string) => {
    setState((prev) => ({
      ...prev,
      [enrolId]: { ...prev[enrolId], [compId]: val },
    }));
  };

  const save = (enrolId: string) => {
    const raw = state[enrolId] ?? {};
    const scores: Record<string, number> = {};
    for (const c of group.components) {
      const v = raw[c.id];
      if (v !== undefined && v !== "") scores[c.id] = Number(v);
    }
    if (Object.keys(scores).length === 0) {
      push("error", "Enter at least one score before saving.");
      return;
    }
    start(async () => {
      const res = await saveScores({
        enrolment_id: enrolId,
        subject_id: group.subject_id,
        term_id: termId,
        scores,
      });
      if (res.ok) { push("success", "Draft saved."); router.refresh(); }
      else push("error", res.error.message);
    });
  };

  const submit = (enrolId: string) => {
    start(async () => {
      try {
        await saveScores({
          enrolment_id: enrolId,
          subject_id: group.subject_id,
          term_id: termId,
          scores: Object.fromEntries(
            group.components.map((c) => [c.id, Number(state[enrolId]?.[c.id] || 0)]),
          ) as Record<string, number>,
        });
        await submitScores(enrolId, group.subject_id, termId);
        push("success", "Submitted for approval.");
        router.refresh();
      } catch (err: any) {
        push("error", err?.message ?? "Failed to submit.");
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Student</th>
            {group.components.map((c) => (
              <th key={c.id} className="py-2">
                {c.name} <span className="text-slate-400">({c.weight}%)</span>
              </th>
            ))}
            <th className="py-2">Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {group.students.map((s) => {
            const raw = state[s.enrolment_id] ?? {};
            const total = computeSubjectTotal(
              group.components.map((c) => ({
                weight: c.weight,
                score: Number(raw[c.id] || 0),
              })),
            );
            return (
              <tr key={s.enrolment_id} className="border-b border-slate-100 last:border-0">
                <td className="py-2">
                  <span className="font-mono text-xs text-slate-500">
                    {s.student.admission_no}
                  </span>{" "}
                  {s.student.surname}, {s.student.first_name}
                </td>
                {group.components.map((c) => (
                  <td key={c.id} className="py-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={raw[c.id] ?? ""}
                      onChange={(e) => update(s.enrolment_id, c.id, e.target.value)}
                      className="!w-20 !py-1 !text-xs"
                    />
                  </td>
                ))}
                <td className="py-2 font-medium">{total.toFixed(1)}</td>
                <td className="py-2 text-right">
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={() => save(s.enrolment_id)} disabled={pending}>
                      Save
                    </Button>
                    <Button size="sm" onClick={() => submit(s.enrolment_id)} disabled={pending}>
                      Submit
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}