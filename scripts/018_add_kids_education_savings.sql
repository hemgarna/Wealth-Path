-- Add kids education savings fields to growth_strategy table
ALTER TABLE growth_strategy
ADD COLUMN IF NOT EXISTS has_kids_education_savings BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kids_education_savings_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS kids_education_savings_return_rate NUMERIC DEFAULT 7.0;

-- Add comment for clarity
COMMENT ON COLUMN growth_strategy.has_kids_education_savings IS 'Whether user is saving for kids education';
COMMENT ON COLUMN growth_strategy.kids_education_savings_amount IS 'Current amount saved for kids education';
COMMENT ON COLUMN growth_strategy.kids_education_savings_return_rate IS 'Annual rate of return for kids education savings';
