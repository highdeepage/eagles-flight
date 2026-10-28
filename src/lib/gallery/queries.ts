import "server-only";
import { createServerSupabase } from "@/lib/db/server";

// ─── Types ─────────────────────────────────────────────────
export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  event_date: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  album_id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ListItem {
  item_key: string;
  item_label: string;
}

export interface AlbumWithCover extends GalleryAlbum {
  cover_url: string | null;
  photo_count: number;
}

export interface HomeAlbumPreview {
  id: string;
  slug: string;
  title: string;
  event_date: string | null;
  photo_count: number;
  cover_url: string;
  extra_urls: string[];
}

// ─── Admin: all albums ─────────────────────────────────────
export async function listAllAlbums(): Promise<GalleryAlbum[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("gallery_albums")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as GalleryAlbum[];
}

export async function getAlbumById(id: string): Promise<GalleryAlbum | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("gallery_albums")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as GalleryAlbum | null) ?? null;
}

// ─── Admin: photos in album ────────────────────────────────
export async function listPhotosInAlbum(albumId: string): Promise<GalleryPhoto[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("gallery_photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order")
    .order("created_at");
  return (data ?? []) as GalleryPhoto[];
}

// ─── Public: albums with cover + count ─────────────────────
export async function listPublicAlbums(): Promise<AlbumWithCover[]> {
  const s = await createServerSupabase();
  const { data: albums } = await s
    .from("gallery_albums")
    .select("*")
    .eq("is_public", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const list = (albums ?? []) as GalleryAlbum[];
  if (list.length === 0) return [];

  const ids = list.map((a) => a.id);
  const { data: photos } = await s
    .from("gallery_photos")
    .select("album_id,image_url,thumbnail_url")
    .in("album_id", ids)
    .order("sort_order");

  const byAlbum: Record<string, { cover: string | null; count: number }> = {};
  for (const p of (photos ?? []) as Array<{
    album_id: string;
    image_url: string;
    thumbnail_url: string | null;
  }>) {
    if (!byAlbum[p.album_id]) {
      byAlbum[p.album_id] = { cover: p.thumbnail_url ?? p.image_url, count: 0 };
    }
    byAlbum[p.album_id]!.count += 1;
  }

  return list.map((a) => ({
    ...a,
    cover_url: byAlbum[a.id]?.cover ?? null,
    photo_count: byAlbum[a.id]?.count ?? 0,
  }));
}

// ─── Public: homepage album preview (4 newest with photos) ─
export async function listPublicAlbumsWithCover(): Promise<HomeAlbumPreview[]> {
  const s = await createServerSupabase();

  const { data: albums } = await s
    .from("gallery_albums")
    .select("id,slug,title,event_date")
    .eq("is_public", true)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(4);

  const list = (albums ?? []) as Array<{
    id: string;
    slug: string;
    title: string;
    event_date: string | null;
  }>;
  if (list.length === 0) return [];

  const ids = list.map((a) => a.id);
  const { data: photos } = await s
    .from("gallery_photos")
    .select("album_id,image_url,thumbnail_url,sort_order")
    .in("album_id", ids)
    .order("sort_order")
    .order("created_at");

  const byAlbum = new Map<string, string[]>();
  for (const p of (photos ?? []) as Array<{
    album_id: string;
    image_url: string;
    thumbnail_url: string | null;
  }>) {
    const url = p.thumbnail_url ?? p.image_url;
    const urls = byAlbum.get(p.album_id) ?? [];
    urls.push(url);
    byAlbum.set(p.album_id, urls);
  }

  const out: HomeAlbumPreview[] = [];
  for (const a of list) {
    const urls = byAlbum.get(a.id) ?? [];
    if (urls.length === 0) continue;
    out.push({
      id: a.id,
      slug: a.slug,
      title: a.title,
      event_date: a.event_date,
      photo_count: urls.length,
      cover_url: urls[0]!,
      extra_urls: urls.slice(1, 4),
    });
  }
  return out;
}

// ─── Public: single album by slug ──────────────────────────
export async function getPublicAlbumBySlug(
  slug: string,
): Promise<{ album: GalleryAlbum; photos: GalleryPhoto[] } | null> {
  const s = await createServerSupabase();
  const { data: album } = await s
    .from("gallery_albums")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  if (!album) return null;

  const { data: photos } = await s
    .from("gallery_photos")
    .select("*")
    .eq("album_id", (album as GalleryAlbum).id)
    .order("sort_order")
    .order("created_at");

  return { album: album as GalleryAlbum, photos: (photos ?? []) as GalleryPhoto[] };
}

// ─── Public: featured photos (kept for compatibility) ──────
export async function listFeaturedPhotos(limit = 6): Promise<GalleryPhoto[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("gallery_photos")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as GalleryPhoto[];
}

// ─── Categories ────────────────────────────────────────────
export async function listGalleryCategories(): Promise<ListItem[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("system_lists")
    .select("item_key,item_label")
    .eq("list_key", "gallery_category")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as ListItem[];
}