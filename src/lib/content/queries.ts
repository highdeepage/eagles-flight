import "server-only";
import { createServerSupabase } from "@/lib/db/server";

// ─── News types ────────────────────────────────────────────
export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  category: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Admin: list all news ──────────────────────────────────
export async function listAllNews(): Promise<NewsPost[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("news_posts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as NewsPost[];
}

// ─── Admin: single post by id ──────────────────────────────
export async function getNewsById(id: string): Promise<NewsPost | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("news_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as NewsPost | null) ?? null;
}

// ─── Public: latest published posts ────────────────────────
export async function listPublishedNews(limit?: number): Promise<NewsPost[]> {
  const s = await createServerSupabase();
  let q = s
    .from("news_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as NewsPost[];
}

// ─── Public: single post by slug ───────────────────────────
export async function getPublishedNewsBySlug(
  slug: string,
): Promise<NewsPost | null> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return (data as NewsPost | null) ?? null;
}

// ─── News categories from system_lists ─────────────────────
export interface ListItem {
  item_key: string;
  item_label: string;
}

export async function listNewsCategories(): Promise<ListItem[]> {
  const s = await createServerSupabase();
  const { data } = await s
    .from("system_lists")
    .select("item_key,item_label")
    .eq("list_key", "news_category")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as ListItem[];
}