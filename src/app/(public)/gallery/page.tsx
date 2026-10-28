import Link from "next/link";
import { listPublicAlbums } from "@/lib/gallery/queries";

export const revalidate = 120;

export const metadata = {
  title: "Gallery",
  description: "Photos from events and life at Eagles Flight Senior Secondary School.",
};

export default async function PublicGalleryPage() {
  const albums = await listPublicAlbums();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <nav className="mb-8 flex items-center gap-6 border-b border-slate-200 pb-4 text-sm font-medium text-slate-600">
      <Link href="/" className="transition hover:text-slate-900">Home</Link>
      <Link href="/news" className="transition hover:text-slate-900">News</Link>
      <Link href="/gallery" className="text-slate-900">Gallery</Link>
      <Link href="/events" className="transition hover:text-slate-900">Events</Link>
    </nav>
      <h1 className="font-display text-4xl font-bold text-slate-900">Gallery</h1>
      <p className="mt-2 text-slate-500">Moments from our school community.</p>

      {albums.length === 0 ? (
        <p className="mt-12 text-slate-500">No albums yet. Check back soon.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/gallery/${album.slug}`}
              className="group block overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                {album.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.cover_url}
                    alt={album.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No photos yet
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                  {album.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {album.photo_count} photo{album.photo_count !== 1 ? "s" : ""}
                  {album.event_date
                    ? ` · ${new Date(album.event_date).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}