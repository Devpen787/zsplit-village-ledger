-- Create the users table
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text,
  role text default 'participant'
);

