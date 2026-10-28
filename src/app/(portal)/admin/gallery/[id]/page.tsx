import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAlbumById,
  listPhotosInAlbum,
  listGalleryCategories,
} from "@/lib/gallery/queries";
import { Card, CardBody, CardHeader } from "@/components/ui";
import { AlbumEditForm } from "./AlbumEditForm";
import { PhotoUploader } from "./PhotoUploader";
import { PhotoGrid } from "./PhotoGrid";

export const metadata = { title: "Album — Admin" };

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [album, photos, categories] = await Promise.all([
    getAlbumById(id),
    listPhotosInAlbum(id),
    listGalleryCategories(),
  ]);
  if (!album) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/gallery" className="text-sm text-blue-700 hover:underline">
            ← Back to albums
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold">{album.title}</h1>
          <p className="text-sm text-slate-500">
            {album.is_public ? "Public" : "Hidden"} ·{" "}
            {album.category ?? "No category"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Photos" description={`${photos.length} photo(s)`} />
          <CardBody>
            <PhotoGrid photos={photos} />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Upload photos" />
            <CardBody>
              <PhotoUploader albumId={album.id} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Album details" />
            <CardBody>
              <AlbumEditForm album={album} categories={categories} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}