-- Update the case_status table constraint to allow new status values
ALTER TABLE case_status
DROP CONSTRAINT IF EXISTS case_status_status_check;

-- Add new constraint with the requested status values
ALTER TABLE case_status
ADD CONSTRAINT case_status_status_check 
CHECK (status IN ('active', 'in_review', 'completed', 'pending', 'on_hold', 'draft', 'submitted', 'reviewed'));

-- Update any existing statuses to match new values
UPDATE case_status 
SET status = 'active' 
WHERE status IN ('draft', 'new');

UPDATE case_status 
SET status = 'in_review' 
WHERE status = 'submitted';

UPDATE case_status 
SET status = 'completed' 
WHERE status = 'reviewed';
