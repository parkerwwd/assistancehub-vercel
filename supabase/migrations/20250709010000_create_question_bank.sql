-- Create a simple reusable question bank for guide quizzes
create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  field_type text not null default 'radio',
  options jsonb not null default '[]'::jsonb, -- [{ value, label }]
  correct_values jsonb not null default '[]'::jsonb, -- ['a'] for radio; can support multi in future
  tags text[] default '{}',
  difficulty text default 'easy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_question_bank_updated_at on public.question_bank;
create trigger set_question_bank_updated_at
before update on public.question_bank
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.question_bank enable row level security;

do $$ begin
  create policy "qb_select_all" on public.question_bank for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "qb_insert_auth" on public.question_bank for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "qb_update_auth" on public.question_bank for update to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Helpful seed example (safe to re-run)
insert into public.question_bank (question_text, field_type, options, correct_values, tags, difficulty)
values
  (
    'What is Section 8 also known as?',
    'radio',
    '[{"value":"hcv","label":"Housing Choice Voucher Program"},{"value":"lifeline","label":"Housing Lifeline Program"},{"value":"public","label":"Public Rental Support"}]',
    '["hcv"]',
    ARRAY['section8','basics'],
    'easy'
  )
on conflict do nothing;


