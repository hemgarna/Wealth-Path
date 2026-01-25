-- Add missing columns to support the new workflow

-- Add completed flag to financial_goals
ALTER TABLE financial_goals ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add completed flag to growth_strategy
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add completed flag to defense_strategy
ALTER TABLE defense_strategy ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Add average return columns to growth_strategy for investment projections
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS average_return_401k_self NUMERIC DEFAULT 7.0;
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS average_return_401k_spouse NUMERIC DEFAULT 7.0;
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS average_return_ira NUMERIC DEFAULT 7.0;
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS average_return_roth_ira NUMERIC DEFAULT 7.0;
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS average_return_hsa NUMERIC DEFAULT 7.0;
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS average_return_brokerage NUMERIC DEFAULT 7.0;

-- Add mortgage fields for primary residence
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS primary_home_mortgage_monthly NUMERIC;
ALTER TABLE growth_strategy ADD COLUMN IF NOT EXISTS primary_home_equity NUMERIC;

-- Add trust funded status to defense_strategy
ALTER TABLE defense_strategy ADD COLUMN IF NOT EXISTS trust_fully_funded BOOLEAN DEFAULT FALSE;

-- Add LTC monthly benefit columns (replacing daily)
ALTER TABLE defense_strategy ADD COLUMN IF NOT EXISTS ltc_monthly_benefit_self NUMERIC;
ALTER TABLE defense_strategy ADD COLUMN IF NOT EXISTS ltc_monthly_benefit_spouse NUMERIC;
