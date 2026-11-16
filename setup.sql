-- Next Level Learning Academy: initial secure database setup
-- Run this in Supabase Dashboard > SQL Editor > New query.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Create a student profile automatically when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone, 'student')
  on conflict (id) do update set
    full_name = excluded.full_name, phone = excluded.phone;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper avoids recursive RLS checks on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin');
$$;

grant execute on function public.is_admin() to authenticated;

-- Students can read only their own profile. Admins can read all profiles.
drop policy if exists "Read own profile or admin reads all" on public.profiles;
create policy "Read own profile or admin reads all" on public.profiles
for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

-- Users can update their own name only; role and phone cannot be changed by clients.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
drop policy if exists "Update own profile name" on public.profiles;
create policy "Update own profile name" on public.profiles
for update to authenticated
using ((select auth.uid()) = id or (select public.is_admin()))
with check ((select auth.uid()) = id or (select public.is_admin()));

-- Admin-only management of course content tables can be added in the next module.
-- IMPORTANT: After the owner has created their account once, run the owner promotion query below
-- after replacing the email if needed. This query must be run manually in SQL Editor by the project owner.
-- update public.profiles p set role = 'admin'
-- from auth.users u where p.id = u.id and u.email = 'ravirajpoot5978@gmail.com';
