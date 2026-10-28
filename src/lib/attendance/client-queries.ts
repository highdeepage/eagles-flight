"use client";

import { createBrowserSupabase } from "@/lib/db/client";

export interface AttendanceStudent {
  id: string;
  surname: string;
  first_name: string;
  other_names: string | null;
  admission_no: string;
}

export interface AttendanceRecordRow {
  student_id: string;
  status: string;
  note: string | null;
}

export async function listStudentsInArm(armId: string): Promise<AttendanceStudent[]> {
  const s = createBrowserSupabase();
  const { data: term } = await s
    .from("terms")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();
  if (!term) return [];

  const { data } = await s
    .from("enrolments")
    .select("students(id,surname,first_name,other_names,admission_no)")
    .eq("class_arm_id", armId)
    .eq("term_id", term.id)
    .eq("status", "enrolled");

  return ((data ?? []) as Array<{ students: AttendanceStudent | null }>)
    .map((r) => r.students)
    .filter((x): x is AttendanceStudent => x !== null);
}

export async function attendanceForDate(
  armId: string,
  date: string,
): Promise<AttendanceRecordRow[]> {
  const s = createBrowserSupabase();
  const { data } = await s
    .from("attendance_records")
    .select("student_id,status,note")
    .eq("class_arm_id", armId)
    .eq("date", date);
  return (data ?? []) as AttendanceRecordRow[];
}