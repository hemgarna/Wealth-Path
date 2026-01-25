-- Create savings_vs_spending table for Section 4
CREATE TABLE IF NOT EXISTS savings_vs_spending (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Monthly Income
  annual_gross_income DECIMAL(12,2),
  federal_tax DECIMAL(12,2),
  state_tax DECIMAL(12,2),
  fica_medicare DECIMAL(12,2),
  pre_tax_401k DECIMAL(12,2),
  pre_tax_hsa DECIMAL(12,2),
  net_monthly_income DECIMAL(12,2),
  
  -- Housing (30%)
  monthly_mortgage_rent DECIMAL(12,2),
  monthly_home_insurance DECIMAL(12,2),
  monthly_property_taxes DECIMAL(12,2),
  total_housing DECIMAL(12,2),
  
  -- Retirement Savings (20%)
  monthly_401k DECIMAL(12,2),
  monthly_roth_ira DECIMAL(12,2),
  monthly_cash_value_life_insurance DECIMAL(12,2),
  total_retirement_savings DECIMAL(12,2),
  
  -- Lifestyle (30%)
  monthly_hoa DECIMAL(12,2),
  monthly_home_maintenance DECIMAL(12,2),
  monthly_utilities DECIMAL(12,2),
  monthly_groceries DECIMAL(12,2),
  monthly_dining_out DECIMAL(12,2),
  monthly_entertainment DECIMAL(12,2),
  monthly_car_insurance DECIMAL(12,2),
  monthly_term_life_premiums DECIMAL(12,2),
  monthly_car_loan_payment DECIMAL(12,2),
  monthly_subscriptions DECIMAL(12,2),
  monthly_shopping DECIMAL(12,2),
  monthly_local_travel DECIMAL(12,2),
  monthly_hobbies DECIMAL(12,2),
  monthly_kids_activities DECIMAL(12,2),
  monthly_other_discretionary DECIMAL(12,2),
  total_lifestyle DECIMAL(12,2),
  
  -- Short-term Savings (20%)
  monthly_emergency_fund DECIMAL(12,2),
  monthly_college_529 DECIMAL(12,2),
  monthly_credit_card_payments DECIMAL(12,2),
  monthly_other_debt_payments DECIMAL(12,2),
  monthly_other_short_term DECIMAL(12,2),
  total_short_term DECIMAL(12,2),
  
  -- Loans (JSONB array)
  loans JSONB DEFAULT '[]'::jsonb,
  
  -- Scenarios
  scenarios JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE savings_vs_spending ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own savings vs spending"
  ON savings_vs_spending FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings vs spending"
  ON savings_vs_spending FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings vs spending"
  ON savings_vs_spending FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings vs spending"
  ON savings_vs_spending FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_savings_vs_spending_updated_at
  BEFORE UPDATE ON savings_vs_spending
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
