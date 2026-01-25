-- Add top_priorities column to financial_goals table
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS top_priorities jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN financial_goals.top_priorities IS 'Array of selected priority areas (e.g., College Funding, Retirement Funding, Tax Planning, etc.)';
