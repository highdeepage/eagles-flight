-- ─────────────────────────────────────────────────────────────
-- 0006_fees_stub.sql
-- Fee structures and manual payment recording.
-- Online payment gateway is NOT part of V1.
-- Parents do not see or trigger payments; only admins record them.
-- ─────────────────────────────────────────────────────────────

create table public.fee_structures (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.academic_sessions(id) on delete cascade,
  term_id     uuid not null references public.terms(id) on delete cascade,
  class_id    uuid not null references public.classes(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null check (amount >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_fees_updated
  before update on public.fee_structures
  for each row execute function public.tg_set_updated_at();

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  enrolment_id  uuid not null references public.enrolments(id) on delete cascade,
  amount        numeric(12,2) not null check (amount > 0),
  method        text not null default 'cash'
    check (method in ('cash','bank_transfer','cheque','other')),
  reference     text unique,
  note          text,
  recorded_by   uuid references public.users(id) on delete set null,
  recorded_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index idx_payments_enrolment on public.payments (enrolment_id);