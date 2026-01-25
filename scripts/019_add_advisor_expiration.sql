-- Add expiration date column to profiles table for financial advisors
-- Advisors will be valid for only one year from creation

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add comment explaining the column
COMMENT ON COLUMN profiles.expires_at IS 'Expiration date for advisor accounts. Account becomes invalid after this date.';

-- Create index for efficient expiration checks
CREATE INDEX IF NOT EXISTS idx_profiles_expires_at ON profiles(expires_at) WHERE role = 'advisor';
