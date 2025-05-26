
-- Fix infinite recursion in RLS policies by simplifying security definer functions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view expenses they're involved in" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses in their groups" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;

DROP POLICY IF EXISTS "Users can view expense memberships for their expenses" ON public.expense_members;
DROP POLICY IF EXISTS "Users can create expense memberships for their expenses" ON public.expense_members;
DROP POLICY IF EXISTS "Users can update relevant expense memberships" ON public.expense_members;

DROP POLICY IF EXISTS "Users can view groups they're members of" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;

DROP POLICY IF EXISTS "Users can view group memberships for their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_members;
DROP POLICY IF EXISTS "Users can update relevant group memberships" ON public.group_members;

DROP POLICY IF EXISTS "Users can view relevant profiles" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Drop the problematic functions
DROP FUNCTION IF EXISTS public.is_user_in_group(uuid, text);
DROP FUNCTION IF EXISTS public.is_user_expense_member(uuid, text);

-- Create simpler, non-recursive security definer functions
CREATE OR REPLACE FUNCTION public.user_group_ids(user_id_param text DEFAULT auth.uid()::text)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT group_id 
  FROM public.group_members 
  WHERE user_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION public.user_expense_ids(user_id_param text DEFAULT auth.uid()::text)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT expense_id 
  FROM public.expense_members 
  WHERE user_id = user_id_param;
$$;

-- SIMPLIFIED RLS POLICIES WITHOUT RECURSION

-- EXPENSES TABLE POLICIES
CREATE POLICY "Users can view their own expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (paid_by = auth.uid()::text);

CREATE POLICY "Users can view expenses they're members of"
ON public.expenses FOR SELECT
TO authenticated
USING (id IN (SELECT public.user_expense_ids(auth.uid()::text)));

CREATE POLICY "Users can view group expenses"
ON public.expenses FOR SELECT
TO authenticated
USING (group_id IN (SELECT public.user_group_ids(auth.uid()::text)));

CREATE POLICY "Users can create expenses"
ON public.expenses FOR INSERT
TO authenticated
WITH CHECK (paid_by = auth.uid()::text);

CREATE POLICY "Users can update their expenses"
ON public.expenses FOR UPDATE
TO authenticated
USING (paid_by = auth.uid()::text)
WITH CHECK (paid_by = auth.uid()::text);

-- EXPENSE_MEMBERS TABLE POLICIES
CREATE POLICY "Users can view their own expense memberships"
ON public.expense_members FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Expense creators can view all memberships"
ON public.expense_members FOR SELECT
TO authenticated
USING (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
));

CREATE POLICY "Expense creators can create memberships"
ON public.expense_members FOR INSERT
TO authenticated
WITH CHECK (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
));

CREATE POLICY "Users can update their own memberships"
ON public.expense_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Expense creators can update memberships"
ON public.expense_members FOR UPDATE
TO authenticated
USING (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
))
WITH CHECK (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
));

-- GROUPS TABLE POLICIES
CREATE POLICY "Users can view their groups"
ON public.groups FOR SELECT
TO authenticated
USING (id IN (SELECT public.user_group_ids(auth.uid()::text)));

CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Group creators can update groups"
ON public.groups FOR UPDATE
TO authenticated
USING (created_by = auth.uid()::text)
WITH CHECK (created_by = auth.uid()::text);

-- GROUP_MEMBERS TABLE POLICIES
CREATE POLICY "Users can view group memberships"
ON public.group_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text 
  OR group_id IN (SELECT public.user_group_ids(auth.uid()::text))
);

CREATE POLICY "Group creators can add members"
ON public.group_members FOR INSERT
TO authenticated
WITH CHECK (group_id IN (
  SELECT id FROM public.groups WHERE created_by = auth.uid()::text
));

CREATE POLICY "Users can update their own membership"
ON public.group_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Group creators can update memberships"
ON public.group_members FOR UPDATE
TO authenticated
USING (group_id IN (
  SELECT id FROM public.groups WHERE created_by = auth.uid()::text
))
WITH CHECK (group_id IN (
  SELECT id FROM public.groups WHERE created_by = auth.uid()::text
));

-- USERS TABLE POLICIES
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY "Users can view group member profiles"
ON public.users FOR SELECT
TO authenticated
USING (id IN (
  SELECT DISTINCT gm.user_id 
  FROM public.group_members gm 
  WHERE gm.group_id IN (SELECT public.user_group_ids(auth.uid()::text))
));

CREATE POLICY "Users can create their own profile"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- GROUP POT ACTIVITY TABLE POLICIES (if it doesn't have RLS yet)
ALTER TABLE public.group_pot_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group pot activities"
ON public.group_pot_activity FOR SELECT
TO authenticated
USING (group_id IN (SELECT public.user_group_ids(auth.uid()::text)));

CREATE POLICY "Users can create group pot activities"
ON public.group_pot_activity FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()::text 
  AND group_id IN (SELECT public.user_group_ids(auth.uid()::text))
);

CREATE POLICY "Users can update their own activities"
ON public.group_pot_activity FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Update calculate_balances function to use new helper functions
CREATE OR REPLACE FUNCTION public.calculate_balances()
RETURNS TABLE(user_id text, user_name text, user_email text, amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH user_groups AS (
    SELECT public.user_group_ids(auth.uid()::text) as group_id
  ),
  group_users AS (
    SELECT DISTINCT gm.user_id
    FROM public.group_members gm
    JOIN user_groups ug ON ug.group_id = gm.group_id
  ),
  paid_amounts AS (
    SELECT 
      e.paid_by,
      SUM(e.amount) as total_paid
    FROM public.expenses e
    JOIN group_users gu ON gu.user_id = e.paid_by
    GROUP BY e.paid_by
  ),
  owed_amounts AS (
    SELECT 
      em.user_id,
      SUM(em.share_value) as total_owed
    FROM public.expense_members em
    JOIN group_users gu ON gu.user_id = em.user_id
    GROUP BY em.user_id
  )
  SELECT 
    u.id,
    u.name,
    u.email,
    COALESCE(p.total_paid, 0) - COALESCE(o.total_owed, 0) as amount
  FROM public.users u
  JOIN group_users gu ON gu.user_id = u.id
  LEFT JOIN paid_amounts p ON p.paid_by = u.id
  LEFT JOIN owed_amounts o ON o.user_id = u.id
  WHERE COALESCE(p.total_paid, 0) > 0 OR COALESCE(o.total_owed, 0) > 0
  ORDER BY u.name;
END;
$$;

