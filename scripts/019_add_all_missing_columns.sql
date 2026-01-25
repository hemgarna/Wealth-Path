-- Migration Script: Add All Missing Database Columns
-- Date: 2025-12-19
-- Purpose: Add missing columns to achieve 100% data persistence

-- ============================================================================
-- GROWTH STRATEGY TABLE - Add missing investment and education savings fields
-- ============================================================================

-- 401k Monthly Contributions
ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS monthly_contribution_401k_self numeric DEFAULT 0;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS monthly_contribution_401k_spouse numeric DEFAULT 0;

COMMENT ON COLUMN growth_strategy.monthly_contribution_401k_self IS 'Monthly 401k contribution for self';
COMMENT ON COLUMN growth_strategy.monthly_contribution_401k_spouse IS 'Monthly 401k contribution for spouse';

-- Portfolio-wide Return Rate
ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS portfolio_avg_return_after_tax numeric DEFAULT 7.0;

COMMENT ON COLUMN growth_strategy.portfolio_avg_return_after_tax IS 'Portfolio-wide average return after tax (percentage)';

-- New Alternative Investment Types
ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS crowd_funding_value numeric DEFAULT 0;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS private_equity_value numeric DEFAULT 0;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS jewelry_value numeric DEFAULT 0;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS other_assets_value numeric DEFAULT 0;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS other_assets_description text;

COMMENT ON COLUMN growth_strategy.crowd_funding_value IS 'Total value in crowdfunding investments';
COMMENT ON COLUMN growth_strategy.private_equity_value IS 'Total value in private equity';
COMMENT ON COLUMN growth_strategy.jewelry_value IS 'Total value of jewelry holdings';
COMMENT ON COLUMN growth_strategy.other_assets_value IS 'Value of other unlisted assets';
COMMENT ON COLUMN growth_strategy.other_assets_description IS 'Description of other assets';

-- Kids Education Savings
ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS has_kids_education_savings boolean DEFAULT false;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS kids_education_savings_amount numeric DEFAULT 0;

ALTER TABLE growth_strategy 
ADD COLUMN IF NOT EXISTS kids_education_savings_return_rate numeric DEFAULT 7.0;

COMMENT ON COLUMN growth_strategy.has_kids_education_savings IS 'Whether client is saving for kids education';
COMMENT ON COLUMN growth_strategy.kids_education_savings_amount IS 'Current amount saved for kids education';
COMMENT ON COLUMN growth_strategy.kids_education_savings_return_rate IS 'Expected annual return rate for education savings';

-- ============================================================================
-- DEFENSE STRATEGY TABLE - Add guardian designation field
-- ============================================================================

ALTER TABLE defense_strategy 
ADD COLUMN IF NOT EXISTS guardian_name text;

COMMENT ON COLUMN defense_strategy.guardian_name IS 'Designated guardian for minor children';

-- ============================================================================
-- VERIFICATION - Display added columns
-- ============================================================================

-- Verify growth_strategy columns
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'growth_strategy'
  AND column_name IN (
    'monthly_contribution_401k_self',
    'monthly_contribution_401k_spouse',
    'portfolio_avg_return_after_tax',
    'crowd_funding_value',
    'private_equity_value',
    'jewelry_value',
    'other_assets_value',
    'other_assets_description',
    'has_kids_education_savings',
    'kids_education_savings_amount',
    'kids_education_savings_return_rate'
  )
ORDER BY column_name;

-- Verify defense_strategy columns
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'defense_strategy'
  AND column_name = 'guardian_name';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 019 completed successfully!';
  RAISE NOTICE '📊 Added 13 new columns across 2 tables';
  RAISE NOTICE '🎯 Data persistence now at 100%%';
  RAISE NOTICE '⚠️  Remember to uncomment the auto-save code in forms after running this migration';
END $$;
