import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getNewsById, listNewsCategories } from "@/lib/content/queries";
import { NewsForm } from "../NewsForm";

export const metadata = { title: "Edit Post — Admin" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getNewsById(id),
    listNewsCategories(),
  ]);
  if (!post) notFound();

  return <NewsForm categories={categories} initial={post} mode="edit" />;
}