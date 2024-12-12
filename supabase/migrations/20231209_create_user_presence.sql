-- Create user_presence table
create table if not exists public.user_presence (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_presence enable row level security;

-- Create policies
create policy "view_online_users"
    on public.user_presence for select
    to authenticated
    using (true);

create policy "insert_own_presence"
    on public.user_presence for insert
    to authenticated
    with check (auth.uid() = id);

create policy "update_own_presence"
    on public.user_presence for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);
