-- Add onboarding fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS dependents INTEGER DEFAULT 0;

-- Update existing profiles to have onboarding_completed = false if null
UPDATE profiles
SET onboarding_completed = COALESCE(onboarding_completed, false)
WHERE onboarding_completed IS NULL;
