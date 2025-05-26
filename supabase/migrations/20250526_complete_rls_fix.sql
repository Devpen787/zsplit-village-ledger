
-- Complete RLS policy fix to resolve infinite recursion

-- First, disable RLS temporarily to avoid issues during migration
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_pot_activity DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on all our tables
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('expenses', 'expense_members', 'groups', 'group_members', 'users', 'group_pot_activity')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Drop ALL existing problematic functions
DROP FUNCTION IF EXISTS public.is_user_in_group(uuid, text);
DROP FUNCTION IF EXISTS public.is_user_expense_member(uuid, text);
DROP FUNCTION IF EXISTS public.user_group_ids(text);
DROP FUNCTION IF EXISTS public.user_expense_ids(text);

-- Create new helper functions that avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_groups(user_id_param text DEFAULT auth.uid()::text)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT group_id 
  FROM public.group_members 
  WHERE user_id = user_id_param;
$$;

CREATE OR REPLACE FUNCTION public.get_user_expenses(user_id_param text DEFAULT auth.uid()::text)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT expense_id 
  FROM public.expense_members 
  WHERE user_id = user_id_param;
$$;

-- Re-enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_pot_activity ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- USERS TABLE
CREATE POLICY "users_select_own" ON public.users
FOR SELECT TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY "users_select_group_members" ON public.users
FOR SELECT TO authenticated
USING (id IN (
  SELECT DISTINCT gm.user_id 
  FROM public.group_members gm 
  WHERE gm.group_id IN (SELECT public.get_user_groups(auth.uid()::text))
));

CREATE POLICY "users_insert_own" ON public.users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid()::text);

CREATE POLICY "users_update_own" ON public.users
FOR UPDATE TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- GROUPS TABLE
CREATE POLICY "groups_select_member" ON public.groups
FOR SELECT TO authenticated
USING (id IN (SELECT public.get_user_groups(auth.uid()::text)));

CREATE POLICY "groups_insert_creator" ON public.groups
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "groups_update_creator" ON public.groups
FOR UPDATE TO authenticated
USING (created_by = auth.uid()::text)
WITH CHECK (created_by = auth.uid()::text);

-- GROUP_MEMBERS TABLE
CREATE POLICY "group_members_select_own" ON public.group_members
FOR SELECT TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "group_members_select_same_group" ON public.group_members
FOR SELECT TO authenticated
USING (group_id IN (SELECT public.get_user_groups(auth.uid()::text)));

CREATE POLICY "group_members_insert_creator" ON public.group_members
FOR INSERT TO authenticated
WITH CHECK (group_id IN (
  SELECT id FROM public.groups WHERE created_by = auth.uid()::text
));

CREATE POLICY "group_members_update_own" ON public.group_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "group_members_update_creator" ON public.group_members
FOR UPDATE TO authenticated
USING (group_id IN (
  SELECT id FROM public.groups WHERE created_by = auth.uid()::text
))
WITH CHECK (group_id IN (
  SELECT id FROM public.groups WHERE created_by = auth.uid()::text
));

-- EXPENSES TABLE
CREATE POLICY "expenses_select_payer" ON public.expenses
FOR SELECT TO authenticated
USING (paid_by = auth.uid()::text);

CREATE POLICY "expenses_select_member" ON public.expenses
FOR SELECT TO authenticated
USING (id IN (SELECT public.get_user_expenses(auth.uid()::text)));

CREATE POLICY "expenses_select_group_member" ON public.expenses
FOR SELECT TO authenticated
USING (group_id IN (SELECT public.get_user_groups(auth.uid()::text)));

CREATE POLICY "expenses_insert_payer" ON public.expenses
FOR INSERT TO authenticated
WITH CHECK (paid_by = auth.uid()::text);

CREATE POLICY "expenses_update_payer" ON public.expenses
FOR UPDATE TO authenticated
USING (paid_by = auth.uid()::text)
WITH CHECK (paid_by = auth.uid()::text);

-- EXPENSE_MEMBERS TABLE
CREATE POLICY "expense_members_select_own" ON public.expense_members
FOR SELECT TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "expense_members_select_expense_creator" ON public.expense_members
FOR SELECT TO authenticated
USING (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
));

CREATE POLICY "expense_members_insert_expense_creator" ON public.expense_members
FOR INSERT TO authenticated
WITH CHECK (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
));

CREATE POLICY "expense_members_update_own" ON public.expense_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "expense_members_update_expense_creator" ON public.expense_members
FOR UPDATE TO authenticated
USING (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
))
WITH CHECK (expense_id IN (
  SELECT id FROM public.expenses WHERE paid_by = auth.uid()::text
));

-- GROUP_POT_ACTIVITY TABLE
CREATE POLICY "group_pot_activity_select_member" ON public.group_pot_activity
FOR SELECT TO authenticated
USING (group_id IN (SELECT public.get_user_groups(auth.uid()::text)));

CREATE POLICY "group_pot_activity_insert_member" ON public.group_pot_activity
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()::text 
  AND group_id IN (SELECT public.get_user_groups(auth.uid()::text))
);

CREATE POLICY "group_pot_activity_update_own" ON public.group_pot_activity
FOR UPDATE TO authenticated
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
    SELECT public.get_user_groups(auth.uid()::text) as group_id
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
