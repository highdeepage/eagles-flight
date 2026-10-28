import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicAlbumBySlug } from "@/lib/gallery/queries";

export const revalidate = 120;

export default async function PublicAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPublicAlbumBySlug(slug);
  if (!result) notFound();

  const { album, photos } = result;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link href="/gallery" className="text-sm text-blue-700 hover:underline">
        ← All albums
      </Link>

      <h1 className="mt-4 font-display text-4xl font-bold text-slate-900">
        {album.title}
      </h1>
      {album.description && (
        <p className="mt-2 max-w-2xl text-slate-600">{album.description}</p>
      )}
      <p className="mt-2 text-sm text-slate-500">
        {photos.length} photo{photos.length !== 1 ? "s" : ""}
        {album.event_date
          ? ` · ${new Date(album.event_date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`
          : ""}
      </p>

      {photos.length === 0 ? (
        <p className="mt-12 text-slate-500">No photos in this album yet.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <a
              key={photo.id}
              href={photo.image_url}
              target="_blank"
              rel="noopener"
              className="group relative block overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail_url ?? photo.image_url}
                alt={photo.caption ?? ""}
                className="aspect-square w-full object-cover transition group-hover:scale-105"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white opacity-0 transition group-hover:opacity-100 line-clamp-2">
                  {photo.caption}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}