-- Add requested_role column to access_requests table
ALTER TABLE public.access_requests 
ADD COLUMN IF NOT EXISTS requested_role TEXT NOT NULL DEFAULT 'client' CHECK (requested_role IN ('client', 'advisor'));

-- Add comment to explain the column
COMMENT ON COLUMN public.access_requests.requested_role IS 'The role requested by the user: client or advisor (Financial Strategist)';
