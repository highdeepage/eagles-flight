-- ─────────────────────────────────────────────────────────────
-- 0003_policies.sql
-- Row Level Security for all Phase 0 tables.
-- Runs after 0002 so public.users and is_admin() exist.
-- ─────────────────────────────────────────────────────────────

-- ── Enable RLS ───────────────────────────────────────────────
alter table public.audit_log        enable row level security;
alter table public.school_settings  enable row level security;
alter table public.system_lists     enable row level security;
alter table public.roles            enable row level security;
alter table public.permissions      enable row level security;
alter table public.role_permissions enable row level security;
alter table public.users            enable row level security;

-- ── school_settings ──────────────────────────────────────────
create policy "settings_read_all" on public.school_settings
  for select using (true);
create policy "settings_write_admin" on public.school_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ── system_lists ─────────────────────────────────────────────
create policy "lists_read_active" on public.system_lists
  for select using (is_active = true or public.is_admin());
create policy "lists_write_admin" on public.system_lists
  for all using (public.is_admin()) with check (public.is_admin());

-- ── audit_log ────────────────────────────────────────────────
create policy "audit_read_admin" on public.audit_log
  for select using (public.is_admin());

-- ── roles ────────────────────────────────────────────────────
create policy "roles_read_all" on public.roles
  for select using (true);
create policy "roles_write_admin" on public.roles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── permissions ──────────────────────────────────────────────
create policy "perms_read_all" on public.permissions
  for select using (true);
create policy "perms_write_admin" on public.permissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── role_permissions ─────────────────────────────────────────
create policy "rp_read_all" on public.role_permissions
  for select using (true);
create policy "rp_write_admin" on public.role_permissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── users ────────────────────────────────────────────────────
create policy "users_read_self" on public.users
  for select using (id = auth.uid() or public.is_admin());
create policy "users_update_self" on public.users
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy "users_admin_insert" on public.users
  for insert with check (public.is_admin() or id = auth.uid());