-- Theme and field bundle presets for enterprise reuse
create table if not exists public.flow_presets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('theme','field_bundle')),
  name text not null,
  slug text not null unique,
  description text,
  data jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_flow_presets_updated_at on public.flow_presets;
create trigger set_flow_presets_updated_at
before update on public.flow_presets
for each row execute procedure public.set_updated_at();

alter table public.flow_presets enable row level security;

do $$ begin
  create policy "flow_presets_select_all" on public.flow_presets for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "flow_presets_write_auth" on public.flow_presets for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Seed a couple of presets
insert into public.flow_presets (kind, name, slug, description, data)
values
  ('theme','Teal','theme-teal','Teal primary with rounded buttons', '{"primaryColor":"#00B8A9","buttonColor":"#00B8A9"}'::jsonb),
  ('field_bundle','Lead Gen','bundle-leadgen','First, Last, Email, Zip, Consent', '{"fields":["firstName","lastName","email","zipCode","consent"]}'::jsonb)
on conflict do nothing;


