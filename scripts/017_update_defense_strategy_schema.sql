-- Migration script to update defense_strategy table for Section 3 changes

-- Add columns for simplified foreign assets (2 categories instead of many)
ALTER TABLE defense_strategy 
ADD COLUMN IF NOT EXISTS foreign_permanent_assets numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS foreign_liquid_assets numeric DEFAULT 0;

-- Add columns for multiple life insurance policies (stored as JSONB array)
-- We'll use the existing children_life_insurance column and expand it to support multiple policies

-- Update comments for clarity
COMMENT ON COLUMN defense_strategy.foreign_permanent_assets IS 'Permanent Assets: Real Estate, Business, etc.';
COMMENT ON COLUMN defense_strategy.foreign_liquid_assets IS 'Liquid Assets: Bank accounts, stocks, bonds, etc.';
COMMENT ON COLUMN defense_strategy.children_life_insurance IS 'Multiple life insurance policies for self, spouse, and children';
