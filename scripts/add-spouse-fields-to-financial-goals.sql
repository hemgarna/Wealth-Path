-- Add spouse_name and spouse_age columns to financial_goals table
ALTER TABLE financial_goals 
ADD COLUMN IF NOT EXISTS spouse_name TEXT,
ADD COLUMN IF NOT EXISTS spouse_age INTEGER;

-- Also add to advisor_financial_goals table for advisor copies
ALTER TABLE advisor_financial_goals 
ADD COLUMN IF NOT EXISTS spouse_name TEXT,
ADD COLUMN IF NOT EXISTS spouse_age INTEGER;
