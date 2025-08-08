-- Flow versioning and audit tables

create table if not exists public.flow_versions (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  slug text not null,
  version integer not null,
  status text not null check (status in ('draft','published','archived')),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  created_by uuid,
  unique(flow_id, version)
);

create index if not exists idx_flow_versions_slug on public.flow_versions(slug);
create index if not exists idx_flow_versions_status on public.flow_versions(status);

create table if not exists public.flow_audit (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  action text not null,
  meta jsonb default '{}',
  created_at timestamptz not null default now(),
  performed_by uuid
);

-- Optional RLS (adjust to your policy model)
alter table public.flow_versions enable row level security;
alter table public.flow_audit enable row level security;

-- Simplistic policies (tighten in production)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='flow_versions' and policyname='flow_versions_read') then
    create policy "flow_versions_read" on public.flow_versions
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='flow_versions' and policyname='flow_versions_write') then
    create policy "flow_versions_write" on public.flow_versions
      for all to authenticated using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='flow_audit' and policyname='flow_audit_read') then
    create policy "flow_audit_read" on public.flow_audit
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='flow_audit' and policyname='flow_audit_write') then
    create policy "flow_audit_write" on public.flow_audit
      for insert to authenticated with check (true);
  end if;
end $$;


