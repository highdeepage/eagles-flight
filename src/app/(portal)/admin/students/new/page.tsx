import { listSystemList } from "@/lib/people/queries";
import { StudentForm } from "../StudentForm";

export const metadata = { title: "New Student — Admin" };

export default async function NewStudentPage() {
  const genders = await listSystemList("gender");
  return <StudentForm genders={genders} />;
}