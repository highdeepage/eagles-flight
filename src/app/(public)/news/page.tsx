import Link from "next/link";
import { listPublishedNews } from "@/lib/content/queries";

export const revalidate = 120;

export const metadata = {
  title: "News & Announcements",
  description: "Latest news from Eagles Flight Senior Secondary School.",
};

export default async function PublicNewsListPage() {
  const posts = await listPublishedNews();

  return (
        <div className="mx-auto max-w-4xl px-6 py-16">
          <nav className="mb-8 flex items-center gap-6 border-b border-slate-200 pb-4 text-sm font-medium text-slate-600">
      <Link href="/" className="transition hover:text-slate-900">Home</Link>
      <Link href="/news" className="text-slate-900">News</Link>
      <Link href="/gallery" className="transition hover:text-slate-900">Gallery</Link>
      <Link href="/events" className="transition hover:text-slate-900">Events</Link>
    </nav>
      <h1 className="font-display text-4xl font-bold text-slate-900">
        News &amp; Announcements
      </h1>
      <p className="mt-2 text-slate-500">Updates from the school community.</p>

      {posts.length === 0 ? (
        <p className="mt-12 text-slate-500">
          No news yet. Check back soon.
        </p>
      ) : (
        <ul className="mt-12 space-y-8">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-slate-200 pb-8 last:border-0">
              <Link href={`/news/${post.slug}`} className="group block">
                <div className="text-xs uppercase tracking-wider text-slate-500">
                  {post.category ?? "News"} ·{" "}
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString()
                    : ""}
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 group-hover:text-blue-700">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-slate-600">{post.excerpt}</p>
                )}
                <div className="mt-3 text-sm font-medium text-blue-700">
                  Read more →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}