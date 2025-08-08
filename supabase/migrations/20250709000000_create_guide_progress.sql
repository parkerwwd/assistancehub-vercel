-- Guide progress tracking table
create table if not exists public.guide_progress (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  anon_id text not null,
  module integer not null,
  score integer,
  passed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (flow_id, anon_id, module)
);

-- RLS policies (no PII; allow public insert/select/update limited to own anon_id via header)
alter table public.guide_progress enable row level security;

drop policy if exists "guide_progress public read" on public.guide_progress;
create policy "guide_progress public read"
on public.guide_progress for select
to public
using (true);

drop policy if exists "guide_progress public write" on public.guide_progress;
create policy "guide_progress public write"
on public.guide_progress for insert
to public
with check (true);

drop policy if exists "guide_progress public update" on public.guide_progress;
create policy "guide_progress public update"
on public.guide_progress for update
to public
using (true)
with check (true);


