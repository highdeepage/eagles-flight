-- ─────────────────────────────────────────────────────────────
-- 0018_content.sql
-- News, gallery albums, gallery photos, events.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.news_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  excerpt         text,
  body            text not null,
  cover_image_url text,
  category        text,
  author_id       uuid references public.users(id) on delete set null,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_news_published on public.news_posts (is_published, published_at desc);

drop trigger if exists trg_news_updated on public.news_posts;
create trigger trg_news_updated
  before update on public.news_posts
  for each row execute function public.tg_set_updated_at();

create table if not exists public.gallery_albums (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  category     text,
  event_date   date,
  is_public    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_album_updated on public.gallery_albums;
create trigger trg_album_updated
  before update on public.gallery_albums
  for each row execute function public.tg_set_updated_at();

create table if not exists public.gallery_photos (
  id             uuid primary key default gen_random_uuid(),
  album_id       uuid not null references public.gallery_albums(id) on delete cascade,
  image_url      text not null,
  thumbnail_url  text,
  caption        text,
  is_featured    boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists idx_photos_album on public.gallery_photos (album_id, sort_order);

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  event_type   text,
  location     text,
  start_at     timestamptz not null,
  end_at       timestamptz,
  is_public    boolean not null default true,
  is_all_day   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_events_start on public.events (start_at desc);
drop trigger if exists trg_events_updated on public.events;
create trigger trg_events_updated
  before update on public.events
  for each row execute function public.tg_set_updated_at();

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

alter table public.news_posts     enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.events         enable row level security;

drop policy if exists "news_read_public"  on public.news_posts;
drop policy if exists "news_write_admin"  on public.news_posts;
create policy "news_read_public"  on public.news_posts for select using (is_published = true or public.is_admin());
create policy "news_write_admin"  on public.news_posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "albums_read_public" on public.gallery_albums;
drop policy if exists "albums_write_admin" on public.gallery_albums;
create policy "albums_read_public" on public.gallery_albums for select using (is_public = true or public.is_admin());
create policy "albums_write_admin" on public.gallery_albums for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "photos_read_public" on public.gallery_photos;
drop policy if exists "photos_write_admin" on public.gallery_photos;
create policy "photos_read_public" on public.gallery_photos for select using (
  exists (select 1 from public.gallery_albums a where a.id = gallery_photos.album_id and a.is_public = true)
  or public.is_admin()
);
create policy "photos_write_admin" on public.gallery_photos for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "events_read_public" on public.events;
drop policy if exists "events_write_admin" on public.events;
create policy "events_read_public" on public.events for select using (is_public = true or public.is_admin());
create policy "events_write_admin" on public.events for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "gallery_public_read" on storage.objects;
drop policy if exists "gallery_admin_write" on storage.objects;
drop policy if exists "gallery_admin_update" on storage.objects;
drop policy if exists "gallery_admin_delete" on storage.objects;
create policy "gallery_public_read"  on storage.objects for select using (bucket_id = 'gallery');
create policy "gallery_admin_write"  on storage.objects for insert with check (bucket_id = 'gallery' and public.is_admin());
create policy "gallery_admin_update" on storage.objects for update using (bucket_id = 'gallery' and public.is_admin());
create policy "gallery_admin_delete" on storage.objects for delete using (bucket_id = 'gallery' and public.is_admin());