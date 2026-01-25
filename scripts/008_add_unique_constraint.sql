-- Add unique constraint on user_id for client_assessments
-- This allows us to use ON CONFLICT (user_id) for upserts
-- Each user should only have one assessment
ALTER TABLE public.client_assessments 
ADD CONSTRAINT client_assessments_user_id_unique UNIQUE (user_id);
