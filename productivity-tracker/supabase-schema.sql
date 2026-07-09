create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text default '',
  theme text default 'dark',
  accent_color text default '#3b82f6',
  animations_enabled boolean default true,
  notifications_enabled boolean default true,
  public_sharing boolean default false,
  xp integer default 0,
  level integer default 1,
  updated_at timestamptz default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  date text not null,
  tasks jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists templates (
  id text not null,
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  tasks jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now(),
  primary key (id, user_id)
);

alter table profiles enable row level security;
alter table logs enable row level security;
alter table templates enable row level security;

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_select_public" on profiles
  for select using (public_sharing = true);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

create policy "logs_select_own" on logs
  for select using (auth.uid() = user_id);

create policy "logs_select_public" on logs
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = logs.user_id
      and profiles.public_sharing = true
    )
  );

create policy "logs_insert_own" on logs
  for insert with check (auth.uid() = user_id);

create policy "logs_update_own" on logs
  for update using (auth.uid() = user_id);

create policy "logs_delete_own" on logs
  for delete using (auth.uid() = user_id);

create policy "templates_select_own" on templates
  for select using (auth.uid() = user_id);

create policy "templates_insert_own" on templates
  for insert with check (auth.uid() = user_id);

create policy "templates_update_own" on templates
  for update using (auth.uid() = user_id);

create policy "templates_delete_own" on templates
  for delete using (auth.uid() = user_id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
