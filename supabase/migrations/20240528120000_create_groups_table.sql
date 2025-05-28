-- Create the groups table
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.users(id) on delete cascade,
  created_at timestamptz default now()
);
