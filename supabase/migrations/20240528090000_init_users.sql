create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text,
  role text default 'participant',
  created_at timestamp with time zone default timezone('utc'::text, now())
);
