-- ─────────────────────────────────────────────────────────────
-- 0008_logo_policies.sql
-- Storage bucket for public assets (school logo, gallery images).
-- Public read, admin-only write.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Anyone can read public assets (school logo used on public site)
create policy "public_assets_read"
  on storage.objects for select
  using (bucket_id = 'public-assets');

-- Only admins can upload/update/delete public assets
create policy "public_assets_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'public-assets' and public.is_admin());

create policy "public_assets_admin_update"
  on storage.objects for update
  using (bucket_id = 'public-assets' and public.is_admin());

create policy "public_assets_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'public-assets' and public.is_admin());