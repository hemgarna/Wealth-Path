-- Add JSONB column to store children's life insurance policies
ALTER TABLE defense_strategy
ADD COLUMN IF NOT EXISTS children_life_insurance JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN defense_strategy.children_life_insurance IS 
'Array of life insurance policies for children. Each policy includes: child_name, coverage_amount, policy_type, annual_premium, provider, start_year, expiration_year';
