-- Add new investment account fields to growth_strategy table

-- Add Annual Average Rate of Return After Tax field for overall portfolio
ALTER TABLE growth_strategy
ADD COLUMN IF NOT EXISTS portfolio_avg_return_after_tax numeric;

-- Add new asset type fields
ALTER TABLE growth_strategy
ADD COLUMN IF NOT EXISTS crowd_funding_value numeric,
ADD COLUMN IF NOT EXISTS private_equity_value numeric,
ADD COLUMN IF NOT EXISTS jewelry_value numeric,
ADD COLUMN IF NOT EXISTS other_assets_value numeric,
ADD COLUMN IF NOT EXISTS other_assets_description text;

COMMENT ON COLUMN growth_strategy.portfolio_avg_return_after_tax IS 'Annual average rate of return after tax for overall portfolio (percentage)';
COMMENT ON COLUMN growth_strategy.crowd_funding_value IS 'Total value of crowd funding investments';
COMMENT ON COLUMN growth_strategy.private_equity_value IS 'Total value of private equity investments';
COMMENT ON COLUMN growth_strategy.jewelry_value IS 'Total value of jewelry assets';
COMMENT ON COLUMN growth_strategy.other_assets_value IS 'Total value of other unlisted assets';
COMMENT ON COLUMN growth_strategy.other_assets_description IS 'Description of other assets';
