-- Create separate tables for each independent section

-- Financial Goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- College Planning
  number_of_children INTEGER DEFAULT 0,
  children JSONB DEFAULT '[]'::jsonb,
  total_college_cost NUMERIC DEFAULT 0,
  
  -- Retirement Planning
  desired_retirement_age INTEGER,
  current_age INTEGER,
  years_to_retirement INTEGER,
  desired_annual_retirement_income NUMERIC DEFAULT 0,
  expected_annual_expenses NUMERIC DEFAULT 0,
  retirement_income_needed_today NUMERIC DEFAULT 0,
  retirement_income_needed_future NUMERIC DEFAULT 0,
  
  -- Medical & Long-term Care
  ltc_monthly_cost_self NUMERIC DEFAULT 0,
  ltc_monthly_cost_spouse NUMERIC DEFAULT 0,
  ltc_years_self INTEGER DEFAULT 0,
  ltc_years_spouse INTEGER DEFAULT 0,
  total_ltc_budget NUMERIC DEFAULT 0,
  
  -- Legacy Planning
  travel_frequency INTEGER DEFAULT 0,
  charity_annual NUMERIC DEFAULT 0,
  legacy_amount NUMERIC DEFAULT 0,
  total_legacy_budget NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_financial_goals UNIQUE(user_id)
);

-- Growth Strategy (Offensive) table
CREATE TABLE IF NOT EXISTS growth_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 401k accounts
  has_401k_self BOOLEAN DEFAULT false,
  current_401k_value_self NUMERIC DEFAULT 0,
  monthly_contribution_401k_self NUMERIC DEFAULT 0,
  employer_match_self NUMERIC DEFAULT 0,
  
  has_401k_spouse BOOLEAN DEFAULT false,
  current_401k_value_spouse NUMERIC DEFAULT 0,
  monthly_contribution_401k_spouse NUMERIC DEFAULT 0,
  employer_match_spouse NUMERIC DEFAULT 0,
  
  -- IRA accounts
  has_traditional_ira BOOLEAN DEFAULT false,
  traditional_ira_value NUMERIC DEFAULT 0,
  
  has_roth_ira BOOLEAN DEFAULT false,
  roth_ira_value NUMERIC DEFAULT 0,
  
  -- HSA
  has_hsa BOOLEAN DEFAULT false,
  hsa_value NUMERIC DEFAULT 0,
  
  -- Social Security
  expected_ss_self NUMERIC DEFAULT 0,
  expected_ss_spouse NUMERIC DEFAULT 0,
  
  -- Pensions
  has_pension_self BOOLEAN DEFAULT false,
  pension_monthly_self NUMERIC DEFAULT 0,
  
  has_pension_spouse BOOLEAN DEFAULT false,
  pension_monthly_spouse NUMERIC DEFAULT 0,
  
  -- Investments
  brokerage_account_value NUMERIC DEFAULT 0,
  stocks_value NUMERIC DEFAULT 0,
  bonds_value NUMERIC DEFAULT 0,
  
  -- Real Estate
  primary_home_value NUMERIC DEFAULT 0,
  primary_home_mortgage NUMERIC DEFAULT 0,
  rental_properties_value NUMERIC DEFAULT 0,
  rental_income_monthly NUMERIC DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_growth_strategy UNIQUE(user_id)
);

-- Defense Strategy (Protective) table
CREATE TABLE IF NOT EXISTS defense_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Life Insurance
  has_life_insurance_self BOOLEAN DEFAULT false,
  life_insurance_coverage_self NUMERIC DEFAULT 0,
  life_insurance_type_self TEXT,
  
  has_life_insurance_spouse BOOLEAN DEFAULT false,
  life_insurance_coverage_spouse NUMERIC DEFAULT 0,
  life_insurance_type_spouse TEXT,
  
  -- Disability Insurance
  has_disability_insurance_self BOOLEAN DEFAULT false,
  disability_coverage_monthly_self NUMERIC DEFAULT 0,
  
  has_disability_insurance_spouse BOOLEAN DEFAULT false,
  disability_coverage_monthly_spouse NUMERIC DEFAULT 0,
  
  -- Long-term Care Insurance
  has_ltc_insurance_self BOOLEAN DEFAULT false,
  ltc_daily_benefit_self NUMERIC DEFAULT 0,
  
  has_ltc_insurance_spouse BOOLEAN DEFAULT false,
  ltc_daily_benefit_spouse NUMERIC DEFAULT 0,
  
  -- Umbrella Insurance
  has_umbrella_insurance BOOLEAN DEFAULT false,
  umbrella_coverage NUMERIC DEFAULT 0,
  
  -- Health Insurance
  has_health_insurance BOOLEAN DEFAULT false,
  health_insurance_deductible NUMERIC DEFAULT 0,
  health_insurance_oop_max NUMERIC DEFAULT 0,
  
  -- Estate Planning
  has_will BOOLEAN DEFAULT false,
  has_trust BOOLEAN DEFAULT false,
  has_poa BOOLEAN DEFAULT false,
  has_healthcare_directive BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_defense_strategy UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_strategy ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view own financial goals" ON financial_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial goals" ON financial_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial goals" ON financial_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial goals" ON financial_goals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own growth strategy" ON growth_strategy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own growth strategy" ON growth_strategy FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own growth strategy" ON growth_strategy FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own growth strategy" ON growth_strategy FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own defense strategy" ON defense_strategy FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own defense strategy" ON defense_strategy FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own defense strategy" ON defense_strategy FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own defense strategy" ON defense_strategy FOR DELETE USING (auth.uid() = user_id);
