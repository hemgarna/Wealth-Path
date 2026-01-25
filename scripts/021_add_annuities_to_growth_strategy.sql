-- Add annuity-related columns to growth_strategy table
ALTER TABLE growth_strategy
ADD COLUMN IF NOT EXISTS has_annuities boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS annuities jsonb DEFAULT '[]'::jsonb;

-- Update RLS policies if needed (currently allows users to update their own growth strategy)

COMMENT ON COLUMN growth_strategy.has_annuities IS 'Whether the user has any annuities';
COMMENT ON COLUMN growth_strategy.annuities IS 'Array of annuity objects with type (growth/lifetime), amount, rate/income, provider';
