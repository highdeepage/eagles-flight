-- ─────────────────────────────────────────────────────────────
-- 0001_foundation.sql
-- Extensions, audit log, school settings, system lists,
-- shared updated_at trigger.
-- NOTE: RLS helper functions and all RLS policies live in 0003.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists citext;

-- ── Shared trigger: updated_at ───────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Audit log ────────────────────────────────────────────────
create table public.audit_log (
  id           bigserial primary key,
  actor_id     uuid,
  actor_email  text,
  action       text not null,
  entity       text not null,
  entity_id    text,
  before       jsonb,
  after        jsonb,
  ip           inet,
  user_agent   text,
  created_at   timestamptz not null default now()
);
create index idx_audit_log_entity on public.audit_log (entity, entity_id);
create index idx_audit_log_actor on public.audit_log (actor_id, created_at desc);
create index idx_audit_log_created on public.audit_log (created_at desc);

-- ── School settings (singleton row) ──────────────────────────
create table public.school_settings (
  id                int primary key default 1 check (id = 1),
  school_name       text not null default '[SCHOOL NAME]',
  short_name        text default '[SHORT NAME]',
  motto             text default '[SCHOOL MOTTO]',
  logo_url          text,
  favicon_url       text,
  address           text default '[SCHOOL ADDRESS]',
  phone_primary     text default '[PHONE]',
  phone_secondary   text default '[PHONE]',
  email_primary     citext default 'info@example.com',
  email_admissions  citext default 'admissions@example.com',
  website           text,
  history           text default '[SCHOOL HISTORY — edit in Admin → Settings]',
  vision            text default '[VISION STATEMENT — edit in Admin → Settings]',
  mission           text default '[MISSION STATEMENT — edit in Admin → Settings]',
  core_values       jsonb not null default '[]'::jsonb,
  principal_name    text default '[PRINCIPAL NAME]',
  principal_message text default '[PRINCIPAL MESSAGE — edit in Admin → Settings]',
  social_links      jsonb not null default '{}'::jsonb,
  footer_text       text default '[FOOTER TEXT]',
  brand_colors      jsonb not null default '{"primary":"#1e3a8a","accent":"#f59e0b","surface":"#ffffff"}'::jsonb,
  passport_photo    jsonb not null default '{"width":400,"height":500,"max_kb":200}'::jsonb,
  locale            text not null default 'en-NG',
  timezone          text not null default 'Africa/Lagos',
  currency          text not null default 'NGN',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger trg_school_settings_updated
  before update on public.school_settings
  for each row execute function public.tg_set_updated_at();

insert into public.school_settings (id) values (1)
on conflict (id) do nothing;

-- ── System lists (drives ALL dropdowns/categories — no hardcoding) ──
create table public.system_lists (
  id          uuid primary key default gen_random_uuid(),
  list_key    text not null,
  item_key    text not null,
  item_label  text not null,
  sort_order  int not null default 0,
  metadata    jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (list_key, item_key)
);
create index idx_system_lists_key on public.system_lists (list_key, sort_order);
create trigger trg_system_lists_updated
  before update on public.system_lists
  for each row execute function public.tg_set_updated_at();