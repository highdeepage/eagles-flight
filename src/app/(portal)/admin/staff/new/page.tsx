import { createServerSupabase } from "@/lib/db/server";
import { listSystemList } from "@/lib/people/queries";
import { StaffForm } from "../StaffForm";

export const metadata = { title: "New Staff — Admin" };

export default async function NewStaffPage() {
  const s = await createServerSupabase();
  const { data: depts } = await s.from("departments").select("id,name").order("name");
  const genders = await listSystemList("gender");

  return <StaffForm departments={depts ?? []} genders={genders} />;
}