-- Add missing columns to final_report table
ALTER TABLE final_report
ADD COLUMN IF NOT EXISTS current_emergency_fund numeric,
ADD COLUMN IF NOT EXISTS suggested_emergency_fund_min numeric,
ADD COLUMN IF NOT EXISTS suggested_emergency_fund_max numeric,
ADD COLUMN IF NOT EXISTS emergency_fund_gap numeric,
ADD COLUMN IF NOT EXISTS current_brokerage numeric,
ADD COLUMN IF NOT EXISTS future_brokerage numeric,
ADD COLUMN IF NOT EXISTS monthly_base_income numeric,
ADD COLUMN IF NOT EXISTS pre_tax_401k numeric,
ADD COLUMN IF NOT EXISTS pre_tax_hsa numeric,
ADD COLUMN IF NOT EXISTS espp numeric;
