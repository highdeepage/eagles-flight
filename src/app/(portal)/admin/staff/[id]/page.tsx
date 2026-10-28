import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db/server";
import { getStaff, getPhotoUrl, listSystemList } from "@/lib/people/queries";
import { StaffForm } from "../StaffForm";
import { StaffLoginCard } from "./StaffLoginCard";

export const metadata = { title: "Staff Detail — Admin" };

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [staff, genders] = await Promise.all([getStaff(id), listSystemList("gender")]);
  if (!staff) notFound();

  const s = await createServerSupabase();
  const { data: depts } = await s.from("departments").select("id,name").order("name");
  const photoUrl = await getPhotoUrl(staff.photo_path);

  const linkedUser = staff.user_id
    ? (
        await s
          .from("users")
          .select("email,role,is_active")
          .eq("id", staff.user_id)
          .single()
      ).data
    : null;

  return (
    <div className="space-y-6">
      {photoUrl && (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Staff photo"
            className="h-24 w-24 rounded-lg border object-cover"
          />
          <div className="text-sm text-slate-500">Current passport photo</div>
        </div>
      )}

      <StaffLoginCard staff={staff} existingUser={linkedUser} />

      <StaffForm
        departments={depts ?? []}
        genders={genders}
        initial={staff}
        mode="edit"
      />
    </div>
  );
}