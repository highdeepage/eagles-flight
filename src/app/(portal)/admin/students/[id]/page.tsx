import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db/server";
import { getStudent, getPhotoUrl, listSystemList } from "@/lib/people/queries";
import { StudentForm } from "../StudentForm";
import { StudentLoginCard } from "./StudentLoginCard";

export const metadata = { title: "Edit Student — Admin" };

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, genders] = await Promise.all([getStudent(id), listSystemList("gender")]);
  if (!student) notFound();

  const photoUrl = await getPhotoUrl(student.photo_path);
  const s = await createServerSupabase();
  const existingUser = student.user_id
    ? (await s.from("users").select("email,is_active").eq("id", student.user_id).single()).data
    : null;

  return (
    <div className="space-y-6">
      {photoUrl && (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Student photo" className="h-24 w-24 rounded-lg border object-cover" />
          <div className="text-sm text-slate-500">Current passport photo</div>
        </div>
      )}
      <StudentLoginCard student={student} existingUser={existingUser} />
      <StudentForm genders={genders} initial={student} mode="edit" />
    </div>
  );
}