-- Next Level Learning Academy - Version 12 Certificate System
-- Run after the existing setup.sql, enrollment-security-update.sql and chapter-progress.sql.
create extension if not exists pgcrypto;

create table if not exists public.course_certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','issued','revoked')),
  certificate_number text unique,
  requested_at timestamptz not null default now(),
  issued_at timestamptz,
  revoked_at timestamptz,
  issued_by uuid references auth.users(id),
  unique(student_id, course_id)
);

alter table public.course_certificates enable row level security;
drop policy if exists "Students and admins read certificates" on public.course_certificates;
create policy "Students and admins read certificates"
on public.course_certificates for select to authenticated
using (student_id = (select auth.uid()) or (select public.is_admin()));

revoke insert, update, delete on public.course_certificates from anon, authenticated;

create or replace function public.request_course_certificate(p_course_id uuid)
returns public.course_certificates
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_total integer;
  v_done integer;
  v_row public.course_certificates;
begin
  if v_student is null then raise exception 'Please sign in first.'; end if;
  if not exists (
    select 1 from public.course_enrollments e
    where e.student_id = v_student and e.course_id = p_course_id
  ) then raise exception 'You are not enrolled in this course.'; end if;

  select count(*) into v_total
  from public.course_chapters ch
  where ch.course_id = p_course_id and ch.is_published = true;

  if v_total = 0 then raise exception 'This course has no published chapters yet.'; end if;

  select count(*) into v_done
  from public.chapter_progress cp
  join public.course_chapters ch on ch.id = cp.chapter_id
  where cp.student_id = v_student
    and ch.course_id = p_course_id
    and ch.is_published = true;

  if v_done < v_total then
    raise exception 'Complete all published chapters before requesting a certificate (% of % completed).', v_done, v_total;
  end if;

  insert into public.course_certificates(student_id, course_id, status)
  values (v_student, p_course_id, 'pending')
  on conflict (student_id, course_id) do nothing;

  select * into v_row from public.course_certificates
  where student_id = v_student and course_id = p_course_id;

  if v_row.status = 'revoked' then
    raise exception 'This certificate request was revoked. Please contact the academy administrator.';
  end if;
  return v_row;
end;
$$;

create or replace function public.admin_issue_course_certificate(p_certificate_id uuid)
returns public.course_certificates
language plpgsql
security definer
set search_path = ''
as $$
declare v_row public.course_certificates;
begin
  if not public.is_admin() then raise exception 'Admin access required.'; end if;
  update public.course_certificates
  set status='issued',
      certificate_number=coalesce(certificate_number,
        'NLLA-' || to_char(now() at time zone 'UTC','YYYY') || '-' ||
        upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
      issued_at=coalesce(issued_at, now()),
      revoked_at=null,
      issued_by=auth.uid()
  where id=p_certificate_id and status='pending'
  returning * into v_row;
  if v_row.id is null then raise exception 'Pending certificate request not found.'; end if;
  return v_row;
end;
$$;

create or replace function public.admin_revoke_course_certificate(p_certificate_id uuid)
returns public.course_certificates
language plpgsql
security definer
set search_path = ''
as $$
declare v_row public.course_certificates;
begin
  if not public.is_admin() then raise exception 'Admin access required.'; end if;
  update public.course_certificates
  set status='revoked', revoked_at=now()
  where id=p_certificate_id and status='issued'
  returning * into v_row;
  if v_row.id is null then raise exception 'Issued certificate not found.'; end if;
  return v_row;
end;
$$;

create or replace function public.verify_course_certificate(p_certificate_number text)
returns table (
  certificate_number text,
  student_name text,
  course_title text,
  certificate_status text,
  issued_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.certificate_number, coalesce(p.full_name,'Student'),
         coalesce(co.title,'Course'), c.status, c.issued_at
  from public.course_certificates c
  join public.profiles p on p.id=c.student_id
  join public.courses co on co.id=c.course_id
  where c.certificate_number = upper(trim(p_certificate_number))
    and c.status in ('issued','revoked')
  limit 1;
$$;

grant execute on function public.request_course_certificate(uuid) to authenticated;
grant execute on function public.admin_issue_course_certificate(uuid) to authenticated;
grant execute on function public.admin_revoke_course_certificate(uuid) to authenticated;
grant execute on function public.verify_course_certificate(text) to anon, authenticated;

comment on table public.course_certificates is
'Course completion certificate requests and issuance status. Public verification exposes only certificate number, student name, course title and status.';
