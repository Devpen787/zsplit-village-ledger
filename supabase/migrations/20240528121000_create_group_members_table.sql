-- Create the group_members table
create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role text default 'participant',
  primary key (group_id, user_id)
);
