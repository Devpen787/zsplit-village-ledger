
-- Function to create a new user that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_new_user(
  user_id TEXT,
  user_email TEXT,
  user_name TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'participant'
) RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER -- This makes it run with the privileges of the function creator
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.users (id, email, name, role)
  VALUES (user_id, user_email, user_name, user_role)
  RETURNING *;
END;
$$;

-- Create policy for the users table to allow users to read their own data
CREATE POLICY IF NOT EXISTS "Users can read their own data" 
  ON public.users
  FOR SELECT
  USING (id::TEXT = auth.uid()::TEXT);

-- Create policy for admin users to read all user data
CREATE POLICY IF NOT EXISTS "Admins can read all user data" 
  ON public.users
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id::TEXT = auth.uid()::TEXT 
    AND role = 'admin'
  ));

-- Explicitly enable RLS on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
