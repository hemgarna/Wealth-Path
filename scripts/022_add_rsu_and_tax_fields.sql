-- Add RSU field to savings_vs_spending table
ALTER TABLE savings_vs_spending
ADD COLUMN IF NOT EXISTS monthly_rsu numeric DEFAULT 0;

-- Add federal tax fields to financial_goals table
ALTER TABLE financial_goals
ADD COLUMN IF NOT EXISTS federal_tax_last_year numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS federal_tax_expected_this_year numeric DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN savings_vs_spending.monthly_rsu IS 'Monthly RSU (Restricted Stock Units) vesting amount';
COMMENT ON COLUMN financial_goals.federal_tax_last_year IS 'Average federal taxes paid last year';
COMMENT ON COLUMN financial_goals.federal_tax_expected_this_year IS 'Expected federal taxes this year';
