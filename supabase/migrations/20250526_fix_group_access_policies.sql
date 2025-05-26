
-- Fix RLS policies for groups table to work with Privy authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Create new policies that work with the group_members table
CREATE POLICY "Users can create groups if they exist in users table" 
  ON public.groups 
  FOR INSERT 
  WITH CHECK (
    created_by IN (SELECT id FROM public.users)
  );

CREATE POLICY "Users can view groups they are members of" 
  ON public.groups 
  FOR SELECT 
  USING (
    id IN (
      SELECT group_id 
      FROM public.group_members 
      WHERE user_id IN (SELECT id FROM public.users)
    )
  );

-- Also ensure group_members table has proper policies
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Drop existing group_members policies if any
DROP POLICY IF EXISTS "Users can view group memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can manage group memberships" ON public.group_members;

-- Create policies for group_members table
CREATE POLICY "Users can view group memberships for their groups" 
  ON public.group_members 
  FOR SELECT 
  USING (
    group_id IN (
      SELECT group_id 
      FROM public.group_members gm2 
      WHERE gm2.user_id IN (SELECT id FROM public.users)
    )
  );

CREATE POLICY "Admins can manage group memberships" 
  ON public.group_members 
  FOR ALL 
  USING (
    user_id IN (SELECT id FROM public.users) AND
    group_id IN (
      SELECT group_id 
      FROM public.group_members gm2 
      WHERE gm2.user_id IN (SELECT id FROM public.users) 
      AND gm2.role = 'admin'
    )
  );
