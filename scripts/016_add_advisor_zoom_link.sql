-- Add zoom_link column to profiles table for advisors
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS zoom_link text;

-- Add comment
COMMENT ON COLUMN profiles.zoom_link IS 'Zoom meeting link for advisor consultations';
