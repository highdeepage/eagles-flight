import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedNewsBySlug } from "@/lib/content/queries";

export const revalidate = 120;

export default async function PublicNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedNewsBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/news" className="text-sm text-blue-700 hover:underline">
        ← Back to news
      </Link>

      <div className="mt-6 text-xs uppercase tracking-wider text-slate-500">
        {post.category ?? "News"} ·{" "}
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </div>

      <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-4 text-lg text-slate-600">{post.excerpt}</p>
      )}

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-8 w-full rounded-lg object-cover"
        />
      )}

      <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
        {post.body}
      </div>
    </article>
  );
}