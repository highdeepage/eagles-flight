import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listAllAlbums, listGalleryCategories } from "@/lib/gallery/queries";
import { Card, CardBody, CardHeader, Button, Empty } from "@/components/ui";
import { Plus, Image as ImageIcon } from "lucide-react";
import { AlbumCard } from "./AlbumCard";
import { NewAlbumForm } from "./NewAlbumForm";

export const metadata = { title: "Gallery — Admin" };

export default async function GalleryAdminPage() {
  await requireAdmin();
  const [albums, categories] = await Promise.all([
    listAllAlbums(),
    listGalleryCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Gallery</h1>
        <p className="mt-1 text-sm text-slate-500">{albums.length} albums</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Albums" icon={<ImageIcon className="h-4 w-4" />} />
          <CardBody>
            {albums.length === 0 ? (
              <Empty
                icon={<ImageIcon className="h-10 w-10" />}
                title="No albums yet"
                description="Create your first album on the right, then upload photos."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="New album" icon={<Plus className="h-4 w-4" />} />
          <CardBody>
            <NewAlbumForm categories={categories} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}