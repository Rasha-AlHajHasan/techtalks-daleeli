-- Backend support for syndicate news subscriptions and login/open notifications.
-- Run this in the Supabase SQL editor after confirming the existing profiles
-- trigger still matches your production schema.

create table if not exists public.user_news_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  syndicate_id uuid not null references public.syndicates(id) on delete cascade,
  is_subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, syndicate_id)
);

create index if not exists user_news_preferences_user_idx
  on public.user_news_preferences (user_id);

create index if not exists user_news_preferences_syndicate_idx
  on public.user_news_preferences (syndicate_id)
  where is_subscribed = true;

alter table public.user_news_preferences enable row level security;

drop policy if exists "Users can read their own news preferences"
  on public.user_news_preferences;
create policy "Users can read their own news preferences"
  on public.user_news_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own news preferences"
  on public.user_news_preferences;
create policy "Users can insert their own news preferences"
  on public.user_news_preferences
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own news preferences"
  on public.user_news_preferences;
create policy "Users can update their own news preferences"
  on public.user_news_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_news_preferences_updated_at
  on public.user_news_preferences;
create trigger set_user_news_preferences_updated_at
before update on public.user_news_preferences
for each row
execute function public.set_updated_at();

-- Optional registration support:
-- If your auth.users -> profiles trigger already exists, merge only the
-- user_news_preferences insert block into it. This version expects signUp
-- metadata keys:
--   syndicate_id: uuid
--   subscribe_to_news: boolean
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    phone_number,
    syndicate_id,
    syndicate_member_number
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone_number',
    nullif(new.raw_user_meta_data ->> 'syndicate_id', '')::uuid,
    new.raw_user_meta_data ->> 'syndicate_member_number'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone_number = excluded.phone_number,
    syndicate_id = excluded.syndicate_id,
    syndicate_member_number = excluded.syndicate_member_number;

  if coalesce((new.raw_user_meta_data ->> 'subscribe_to_news')::boolean, false)
    and nullif(new.raw_user_meta_data ->> 'syndicate_id', '') is not null
  then
    insert into public.user_news_preferences (
      user_id,
      syndicate_id,
      is_subscribed
    )
    values (
      new.id,
      (new.raw_user_meta_data ->> 'syndicate_id')::uuid,
      true
    )
    on conflict (user_id, syndicate_id) do update set
      is_subscribed = excluded.is_subscribed;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
