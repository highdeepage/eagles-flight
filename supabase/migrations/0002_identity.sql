-- ─────────────────────────────────────────────────────────────
-- 0002_identity.sql
-- Roles, permissions, users mirror, auth sync trigger,
-- and RLS helper functions (which depend on public.users).
-- ─────────────────────────────────────────────────────────────

-- ── Roles ────────────────────────────────────────────────────
create table public.roles (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  name        text not null,
  description text,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_roles_updated
  before update on public.roles
  for each row execute function public.tg_set_updated_at();

-- ── Permissions ──────────────────────────────────────────────
create table public.permissions (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ── Users mirror of auth.users ───────────────────────────────
create table public.users (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          citext not null unique,
  role           text not null references public.roles(key),
  full_name      text,
  phone          text,
  avatar_url     text,
  is_active      boolean not null default true,
  must_change_pw boolean not null default false,
  last_login_at  timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_users_role on public.users (role, is_active);
create trigger trg_users_updated
  before update on public.users
  for each row execute function public.tg_set_updated_at();

-- ── Sync trigger: auth.users → public.users ──────────────────
create or replace function public.tg_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_name text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  v_name := coalesce(new.raw_user_meta_data->>'full_name', null);

  if not exists (select 1 from public.roles where key = v_role) then
    v_role := 'student';
  end if;

  insert into public.users (id, email, role, full_name)
  values (new.id, new.email, v_role, v_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_auth_user();

-- ── RLS helper functions (require public.users to exist) ─────
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_name() in ('admin','principal'), false);
$$;