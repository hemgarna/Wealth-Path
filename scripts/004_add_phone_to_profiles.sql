-- Add phone number to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone_number);

-- Update RLS policies remain the same (already covers all columns)
