-- Drop existing simplified tables if they exist
DROP TABLE IF EXISTS questionnaire_responses CASCADE;

-- Create comprehensive financial assessment table
CREATE TABLE IF NOT EXISTS financial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_step INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  last_saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- SECTION 1: FINANCIAL GOALS
  -- College Planning
  college_child1_age INTEGER,
  college_child1_years_from_today INTEGER,
  college_child1_begin_year INTEGER,
  college_child1_end_year INTEGER,
  college_child1_amount DECIMAL(15, 2),
  
  college_child2_age INTEGER,
  college_child2_years_from_today INTEGER,
  college_child2_begin_year INTEGER,
  college_child2_end_year INTEGER,
  college_child2_amount DECIMAL(15, 2),
  
  -- Kids Marriage Planning
  marriage_child1_years_from_today INTEGER,
  marriage_child1_year INTEGER,
  marriage_child1_amount DECIMAL(15, 2) DEFAULT 75000,
  
  marriage_child2_years_from_today INTEGER,
  marriage_child2_year INTEGER,
  marriage_child2_amount DECIMAL(15, 2) DEFAULT 75000,
  
  -- Retirement Planning
  retirement_age INTEGER DEFAULT 67,
  retirement_years_from_today INTEGER,
  retirement_begin_year INTEGER,
  retirement_end_year INTEGER,
  monthly_retirement_income_today DECIMAL(15, 2),
  annual_retirement_income_today DECIMAL(15, 2),
  annual_retirement_income_at_65_pretax DECIMAL(15, 2),
  annual_retirement_income_with_inflation DECIMAL(15, 2),
  
  -- Long Term Care / Medical Expenses
  healthcare_out_of_pocket_amount DECIMAL(15, 2) DEFAULT 500000,
  long_term_care_amount DECIMAL(15, 2) DEFAULT 500000,
  
  -- Life Goals
  life_goals_travel TEXT,
  life_goals_vacation_home TEXT,
  life_goals_charity TEXT,
  life_goals_other TEXT,
  
  -- Legacy Planning
  legacy_kids_home_business BOOLEAN DEFAULT false,
  legacy_assets_for_family BOOLEAN DEFAULT false,
  legacy_special_needs TEXT,
  
  -- SECTION 2: CURRENT POSITION / ASSETS
  -- Retirement Planning (USA)
  has_401k_him BOOLEAN DEFAULT false,
  has_401k_her BOOLEAN DEFAULT false,
  current_401k_value DECIMAL(15, 2),
  company_match_him DECIMAL(5, 2),
  company_match_her DECIMAL(5, 2),
  max_funding_401k_him BOOLEAN DEFAULT false,
  max_funding_401k_her BOOLEAN DEFAULT false,
  projected_401k_at_65 DECIMAL(15, 2),
  
  has_traditional_ira BOOLEAN DEFAULT false,
  traditional_ira_value DECIMAL(15, 2),
  
  has_roth_ira BOOLEAN DEFAULT false,
  roth_ira_value DECIMAL(15, 2),
  
  has_hsa BOOLEAN DEFAULT false,
  hsa_value DECIMAL(15, 2),
  
  social_security_projected DECIMAL(15, 2) DEFAULT 72000,
  
  has_pension BOOLEAN DEFAULT false,
  pension_value DECIMAL(15, 2),
  
  -- Real Estate Investments (USA)
  has_personal_home BOOLEAN DEFAULT false,
  personal_home_equity DECIMAL(15, 2),
  
  has_rental_properties BOOLEAN DEFAULT false,
  rental_properties_value DECIMAL(15, 2),
  rental_income_monthly DECIMAL(15, 2),
  
  has_land_parcels BOOLEAN DEFAULT false,
  land_value DECIMAL(15, 2),
  
  has_usa_inheritance BOOLEAN DEFAULT false,
  usa_inheritance_value DECIMAL(15, 2),
  
  -- Stocks / Business / Income (USA)
  has_stocks_outside_401k BOOLEAN DEFAULT false,
  stocks_value DECIMAL(15, 2),
  
  owns_business BOOLEAN DEFAULT false,
  business_value DECIMAL(15, 2),
  
  has_alternative_investments BOOLEAN DEFAULT false,
  alternative_investments_value DECIMAL(15, 2),
  
  has_cds BOOLEAN DEFAULT false,
  cds_value DECIMAL(15, 2),
  
  cash_in_bank DECIMAL(15, 2),
  emergency_fund DECIMAL(15, 2),
  
  -- Family Protection & Insurance
  life_insurance_work_him DECIMAL(15, 2),
  life_insurance_work_her DECIMAL(15, 2),
  
  life_insurance_outside_him DECIMAL(15, 2),
  life_insurance_outside_her DECIMAL(15, 2),
  
  is_cash_value_life_insurance BOOLEAN DEFAULT false,
  life_insurance_company TEXT,
  
  has_disability_insurance BOOLEAN DEFAULT false,
  has_long_term_care_insurance BOOLEAN DEFAULT false,
  has_mortgage_protection BOOLEAN DEFAULT false,
  has_umbrella_insurance BOOLEAN DEFAULT false,
  
  -- College Planning / Estate Planning
  has_529_plans BOOLEAN DEFAULT false,
  plan_529_value DECIMAL(15, 2),
  
  has_will_and_trust BOOLEAN DEFAULT false,
  estate_planning_updated_year INTEGER,
  
  -- Monthly Budget
  monthly_net_pay DECIMAL(15, 2),
  monthly_mortgage_rent DECIMAL(15, 2),
  monthly_retirement_savings DECIMAL(15, 2),
  monthly_lifestyle DECIMAL(15, 2),
  monthly_short_term_savings DECIMAL(15, 2),
  
  -- SECTION 3: FOREIGN FINANCIAL ASSETS (FBAR/FATCA)
  -- Retirement Plans (Offshore)
  offshore_retirement_funds DECIMAL(15, 2),
  offshore_pension DECIMAL(15, 2),
  
  -- Real Estate (Offshore)
  offshore_real_estate_value DECIMAL(15, 2),
  offshore_rental_income DECIMAL(15, 2),
  
  -- Business (Offshore)
  offshore_business_value DECIMAL(15, 2),
  offshore_inheritance DECIMAL(15, 2),
  
  -- Stock Market (Offshore)
  offshore_stocks DECIMAL(15, 2),
  offshore_mutual_funds DECIMAL(15, 2),
  offshore_fixed_deposits DECIMAL(15, 2),
  offshore_savings_accounts DECIMAL(15, 2),
  offshore_gold_silver DECIMAL(15, 2),
  
  -- Family Protection (Offshore)
  offshore_life_insurance DECIMAL(15, 2),
  offshore_health_insurance DECIMAL(15, 2),
  
  -- Estate Planning & Emergency (Offshore)
  offshore_emergency_fund DECIMAL(15, 2),
  offshore_other_investments DECIMAL(15, 2),
  
  -- Calculated totals
  total_fbar_amount DECIMAL(15, 2),
  total_foreign_networth DECIMAL(15, 2),
  total_usa_networth DECIMAL(15, 2),
  total_networth DECIMAL(15, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE financial_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessments"
  ON financial_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON financial_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON financial_assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Advisors can view all assessments
CREATE POLICY "Advisors can view all assessments"
  ON financial_assessments FOR SELECT
  USING (is_advisor());

CREATE POLICY "Advisors can update all assessments"
  ON financial_assessments FOR UPDATE
  USING (is_advisor());

-- Create index for better query performance
CREATE INDEX idx_financial_assessments_user_id ON financial_assessments(user_id);
CREATE INDEX idx_financial_assessments_status ON financial_assessments(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_assessment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_assessment_timestamp
  BEFORE UPDATE ON financial_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_assessment_updated_at();
