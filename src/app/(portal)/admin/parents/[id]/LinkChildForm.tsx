"use client";

import { useState, useTransition } from "react";
import { linkParentToStudent } from "@/lib/people/actions";
import { Button, Select, Label, useToast } from "@/components/ui";

export function LinkChildForm({
  parentId, students, relationships,
}: {
  parentId: string;
  students: { id: string; admission_no: string; surname: string; first_name: string }[];
  relationships: { item_key: string; item_label: string }[];
}) {
  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [primary, setPrimary] = useState(false);
  const [pending, start] = useTransition();
  const { push } = useToast();

  const submit = () => {
    if (!studentId) return push("error", "Choose a student.");
    start(async () => {
      try {
        await linkParentToStudent(parentId, studentId, relationship, primary);
        push("success", "Linked.");
        setStudentId(""); setRelationship(""); setPrimary(false);
      } catch (err: any) { push("error", err?.message ?? "Failed."); }
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3">
      <div>
        <Label>Student</Label>
        <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Choose…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.admission_no} — {s.surname} {s.first_name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Relationship</Label>
        <Select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          <option value="">—</option>
          {relationships.map((r) => <option key={r.item_key} value={r.item_key}>{r.item_label}</option>)}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} />
        Primary contact
      </label>
      <Button onClick={submit} loading={pending} size="sm">Link child</Button>
    </div>
  );
}