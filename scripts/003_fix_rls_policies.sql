-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic advisor policy
DROP POLICY IF EXISTS "Advisors can view all profiles" ON public.profiles;

-- Create a security definer function to check if user is an advisor
CREATE OR REPLACE FUNCTION public.is_advisor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'advisor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate advisor policies using the security definer function
-- For assessments
DROP POLICY IF EXISTS "Advisors can view all assessments" ON public.client_assessments;
DROP POLICY IF EXISTS "Advisors can update all assessments" ON public.client_assessments;

CREATE POLICY "Advisors can view all assessments"
  ON public.client_assessments FOR SELECT
  USING (public.is_advisor(auth.uid()));

CREATE POLICY "Advisors can update all assessments"
  ON public.client_assessments FOR UPDATE
  USING (public.is_advisor(auth.uid()));

-- For analyses
DROP POLICY IF EXISTS "Advisors can view all analyses" ON public.financial_analyses;
DROP POLICY IF EXISTS "Advisors can update all analyses" ON public.financial_analyses;

CREATE POLICY "Advisors can view all analyses"
  ON public.financial_analyses FOR SELECT
  USING (public.is_advisor(auth.uid()));

CREATE POLICY "Advisors can update all analyses"
  ON public.financial_analyses FOR UPDATE
  USING (public.is_advisor(auth.uid()));

-- Add a service role policy for profiles so advisors can query via service role
-- This allows the proxy middleware to check roles without hitting RLS
CREATE POLICY "Service role can view all profiles"
  ON public.profiles FOR SELECT
  TO service_role
  USING (true);
