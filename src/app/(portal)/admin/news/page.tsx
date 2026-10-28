import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAllNews } from "@/lib/content/queries";
import { Card, CardBody, CardHeader, Button, Empty } from "@/components/ui";
import { Plus, Newspaper } from "lucide-react";
import { NewsRow } from "./NewsRow";

export const metadata = { title: "News — Admin" };

export default async function NewsAdminPage() {
  await requireAdmin();
  const rows = await listAllNews();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            News &amp; Announcements
          </h1>
          <p className="mt-1 text-sm text-slate-500">{rows.length} posts</p>
        </div>
        <Link href="/admin/news/new">
          <Button icon={<Plus className="h-4 w-4" />}>New post</Button>
        </Link>
      </div>

      <Card>
        <CardHeader title="All posts" icon={<Newspaper className="h-4 w-4" />} />
        <CardBody>
          {rows.length === 0 ? (
            <Empty
              icon={<Newspaper className="h-10 w-10" />}
              title="No posts yet"
              description="Create your first news post to display on the public site."
              action={
                <Link href="/admin/news/new">
                  <Button>Create post</Button>
                </Link>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((post) => (
                  <NewsRow key={post.id} post={post} />
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}