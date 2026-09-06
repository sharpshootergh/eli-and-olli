-- Elisha & Olivia wedding site — Postgres schema for Supabase
-- Apply via Supabase SQL editor, or `supabase db push` after linking a project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Events (two wedding celebrations)
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  event_time time,
  location text not null,
  venue_name text,
  gps_url text,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id text primary key,
  name text not null,
  event_date text not null,
  event_time text,
  location text not null,
  venue_name text,
  gps_url text,
  notes text,
  sort_order int not null default 0,
  attendance_key text not null default 'traditional',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Registry
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  type text not null check (type in ('capped', 'open')),
  target_amount numeric check (target_amount is null or target_amount > 0),
  amount_raised numeric not null default 0 check (amount_raised >= 0),
  contributor_count int not null default 0 check (contributor_count >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint goals_capped_requires_target check (
    (type = 'open' and target_amount is null)
    or (type = 'capped' and target_amount is not null)
  )
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  contributor_name text not null,
  contributor_email text not null,
  contributor_phone text,
  amount numeric not null check (amount > 0),
  message text,
  paystack_reference text unique not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Moments (photos + videos)
-- ---------------------------------------------------------------------------

create table if not exists public.moments_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  thumbnail_url text,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Site content media (home hero + story images and video)
-- ---------------------------------------------------------------------------

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('hero', 'story')),
  media_url text not null,
  mobile_media_url text,
  media_type text not null check (media_type in ('image', 'video')),
  video_provider text not null default 'file' check (video_provider in ('file', 'youtube')),
  caption text,
  object_position text not null default 'center center',
  mobile_object_position text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RSVPs
-- ---------------------------------------------------------------------------

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  attendance text not null check (attendance in ('traditional', 'white', 'both', 'none')),
  guest_count int not null default 1 check (guest_count >= 1),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin allowlist (seed primary admin)
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  added_by text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists events_sort_order_idx on public.events (sort_order);
create index if not exists goals_category_id_idx on public.goals (category_id);
create index if not exists goals_sort_order_idx on public.goals (sort_order);
create index if not exists categories_sort_order_idx on public.categories (sort_order);
create index if not exists contributions_goal_id_idx on public.contributions (goal_id);
create index if not exists contributions_created_at_idx on public.contributions (created_at desc);
create index if not exists moments_photos_sort_order_idx on public.moments_photos (sort_order);
create index if not exists site_media_section_sort_order_idx on public.site_media (section, sort_order);
create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);
create index if not exists rsvps_attendance_idx on public.rsvps (attendance);
create index if not exists admin_users_email_idx on public.admin_users (email);

-- ---------------------------------------------------------------------------
-- Atomic payment confirmation (service role / webhook only)
-- ---------------------------------------------------------------------------

create or replace function public.confirm_contribution(
  p_goal_id uuid,
  p_amount numeric,
  p_contributor_name text,
  p_contributor_email text,
  p_contributor_phone text,
  p_message text,
  p_paystack_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.contributions
  where paystack_reference = p_paystack_reference;

  if v_id is not null then
    return v_id;
  end if;

  insert into public.contributions (
    goal_id, contributor_name, contributor_email, contributor_phone,
    amount, message, paystack_reference
  ) values (
    p_goal_id, p_contributor_name, p_contributor_email, p_contributor_phone,
    p_amount, p_message, p_paystack_reference
  )
  returning id into v_id;

  update public.goals
  set
    amount_raised = amount_raised + p_amount,
    contributor_count = contributor_count + 1
  where id = p_goal_id;

  return v_id;
end;
$$;

create or replace function public.increment_goal_amount(goal_id uuid, bump_amount numeric)
returns void
language sql
security definer
set search_path = public
as $$
  update public.goals
  set amount_raised = amount_raised + bump_amount
  where id = goal_id;
$$;

revoke all on function public.confirm_contribution from public, anon, authenticated;
revoke all on function public.increment_goal_amount from public, anon, authenticated;
grant execute on function public.confirm_contribution to service_role;
grant execute on function public.increment_goal_amount to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.events enable row level security;
alter table public.site_events enable row level security;
alter table public.categories enable row level security;
alter table public.goals enable row level security;
alter table public.contributions enable row level security;
alter table public.moments_photos enable row level security;
alter table public.site_media enable row level security;
alter table public.rsvps enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "events_public_read" on public.events;
drop policy if exists "events_admin_all" on public.events;
drop policy if exists "categories_public_read" on public.categories;
drop policy if exists "goals_public_read" on public.goals;
drop policy if exists "moments_public_read" on public.moments_photos;
drop policy if exists "site_media_public_read" on public.site_media;
drop policy if exists "categories_admin_all" on public.categories;
drop policy if exists "goals_admin_all" on public.goals;
drop policy if exists "moments_admin_all" on public.moments_photos;
drop policy if exists "site_media_admin_all" on public.site_media;
drop policy if exists "contributions_admin_read" on public.contributions;
drop policy if exists "rsvps_public_insert" on public.rsvps;
drop policy if exists "rsvps_admin_read" on public.rsvps;
drop policy if exists "admin_users_admin_read" on public.admin_users;
drop policy if exists "admin_users_admin_insert" on public.admin_users;
drop policy if exists "admin_users_admin_delete" on public.admin_users;
drop policy if exists "Allow public read access to categories" on public.categories;
drop policy if exists "Allow public read access to goals" on public.goals;
drop policy if exists "Allow public read access to moments_photos" on public.moments_photos;
drop policy if exists "Allow public read access to contributions" on public.contributions;
drop policy if exists "Allow authenticated admin full access to categories" on public.categories;
drop policy if exists "Allow authenticated admin full access to goals" on public.goals;
drop policy if exists "Allow authenticated admin full access to moments_photos" on public.moments_photos;
drop policy if exists "Allow authenticated admin full access to contributions" on public.contributions;

create policy "events_public_read"
  on public.events for select to anon, authenticated using (true);

create policy "events_admin_all"
  on public.events for all to authenticated using (true) with check (true);

create policy "categories_public_read"
  on public.categories for select to anon, authenticated using (true);

create policy "goals_public_read"
  on public.goals for select to anon, authenticated using (true);

create policy "moments_public_read"
  on public.moments_photos for select to anon, authenticated using (true);

create policy "site_media_public_read"
  on public.site_media for select to anon, authenticated using (true);

create policy "categories_admin_all"
  on public.categories for all to authenticated using (true) with check (true);

create policy "goals_admin_all"
  on public.goals for all to authenticated using (true) with check (true);

create policy "moments_admin_all"
  on public.moments_photos for all to authenticated using (true) with check (true);

create policy "site_media_admin_all"
  on public.site_media for all to authenticated using (true) with check (true);

create policy "contributions_admin_read"
  on public.contributions for select to authenticated using (true);

-- Guests can submit RSVPs; only admins can read them
create policy "rsvps_public_insert"
  on public.rsvps for insert to anon, authenticated with check (true);

create policy "rsvps_admin_read"
  on public.rsvps for select to authenticated using (true);

-- Admin allowlist: authenticated admins manage; public cannot read emails
-- Login checks use service role API route
create policy "admin_users_admin_all"
  on public.admin_users for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'goal-images', 'goal-images', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'moments', 'moments', true, 104857600,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  ),
  (
    'story-media', 'story-media', true, 104857600,
    array['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "goal_images_public_read" on storage.objects;
drop policy if exists "moments_public_read" on storage.objects;
drop policy if exists "story_media_public_read" on storage.objects;
drop policy if exists "admin_storage_insert" on storage.objects;
drop policy if exists "admin_storage_update" on storage.objects;
drop policy if exists "admin_storage_delete" on storage.objects;
drop policy if exists "media_public_read" on storage.objects;

create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('goal-images', 'moments', 'story-media'));

create policy "admin_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('goal-images', 'moments', 'story-media'));

create policy "admin_storage_update"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('goal-images', 'moments', 'story-media'))
  with check (bucket_id in ('goal-images', 'moments', 'story-media'));

create policy "admin_storage_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('goal-images', 'moments', 'story-media'));

-- ---------------------------------------------------------------------------
-- Seeds
-- ---------------------------------------------------------------------------

insert into public.admin_users (email, added_by)
select 'elishaatosagoe@gmail.com', 'seed'
where not exists (
  select 1 from public.admin_users where lower(email) = 'elishaatosagoe@gmail.com'
);

insert into public.events (name, event_date, event_time, location, sort_order)
select * from (values
  ('Traditional Wedding'::text, '2026-12-12'::date, null::time, 'Abidjan, Ivory Coast'::text, 1),
  ('White Wedding'::text, '2026-12-19'::date, '12:00'::time, 'Cape Coast, Ghana'::text, 2)
) as v(name, event_date, event_time, location, sort_order)
where not exists (select 1 from public.events limit 1);

insert into public.categories (name, sort_order)
select * from (values
  ('Home', 1),
  ('Honeymoon', 2),
  ('Just because', 3)
) as v(name, sort_order)
where not exists (select 1 from public.categories limit 1);

-- ---------------------------------------------------------------------------
-- Safe upgrades for databases created from an earlier schema revision
-- ---------------------------------------------------------------------------

alter table public.moments_photos
  add column if not exists media_type text not null default 'image';

alter table public.moments_photos
  add column if not exists thumbnail_url text;

alter table public.goals
  add column if not exists contributor_count int not null default 0;

alter table public.site_media
  add column if not exists mobile_media_url text;

alter table public.site_media
  add column if not exists mobile_object_position text;

do $$
begin
  alter table public.moments_photos
    drop constraint if exists moments_photos_media_type_check;
  alter table public.moments_photos
    add constraint moments_photos_media_type_check
    check (media_type in ('image', 'video'));
exception when others then
  null;
end $$;
