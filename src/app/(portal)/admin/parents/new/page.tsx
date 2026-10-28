import { listSystemList } from "@/lib/people/queries";
import { ParentForm } from "../ParentForm";

export const metadata = { title: "New Parent — Admin" };

export default async function NewParentPage() {
  const relationships = await listSystemList("relationship");
  return <ParentForm relationships={relationships} />;
}