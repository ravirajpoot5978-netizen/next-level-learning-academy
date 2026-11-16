-- Next Level Learning Academy: Admin-managed Learning Lab content
-- Run once in Supabase SQL Editor. Existing tables/data are not modified.
create table if not exists public.learning_lab_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 180),
  subject text not null check (char_length(subject) between 2 and 80),
  item_type text not null check (item_type in ('lesson','quiz','typing','coding','game')),
  content jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists learning_lab_items_public_idx on public.learning_lab_items (is_published, subject, item_type);
alter table public.learning_lab_items enable row level security;
drop policy if exists "Published learning lab items are readable" on public.learning_lab_items;
create policy "Published learning lab items are readable" on public.learning_lab_items for select using (is_published = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins manage learning lab items" on public.learning_lab_items;
create policy "Admins manage learning lab items" on public.learning_lab_items for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
