-- Fix case_sharing permission_level check constraint to allow 'full_access'

-- Drop the existing constraint
ALTER TABLE case_sharing DROP CONSTRAINT IF EXISTS case_sharing_permission_level_check;

-- Add a new constraint that includes 'full_access'
ALTER TABLE case_sharing ADD CONSTRAINT case_sharing_permission_level_check 
  CHECK (permission_level IN ('view', 'edit', 'full', 'full_access'));
