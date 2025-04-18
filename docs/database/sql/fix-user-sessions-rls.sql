-- SQL script to fix the RLS policies for the user_sessions table
-- This script allows authenticated users to insert their own session records
-- while maintaining security by ensuring they can only create records for themselves

-- First, drop the restrictive policy if it exists
DROP POLICY IF EXISTS "Disallow public modification" ON public.user_sessions;

-- Create a policy that allows authenticated users to insert their own session records
CREATE POLICY "Allow authenticated users to insert their own sessions"
ON public.user_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Keep the policy that allows users to read their own sessions
-- If it doesn't exist yet, create it
CREATE POLICY IF NOT EXISTS "Allow individual user read access"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Verify that RLS is enabled on the table
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Add a comment to the table explaining the RLS policies
COMMENT ON TABLE public.user_sessions IS 'Logs individual user login sessions. RLS policies allow users to insert and read their own sessions only.';