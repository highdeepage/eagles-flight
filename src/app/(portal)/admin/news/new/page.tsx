import { requireAdmin } from "@/lib/auth/session";
import { listNewsCategories } from "@/lib/content/queries";
import { NewsForm } from "../NewsForm";

export const metadata = { title: "New Post — Admin" };

export default async function NewNewsPage() {
  await requireAdmin();
  const categories = await listNewsCategories();
  return <NewsForm categories={categories} mode="create" />;
}