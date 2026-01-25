-- Drop and recreate all three tables with exact columns from the document

DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS growth_strategy CASCADE;
DROP TABLE IF EXISTS defense_strategy CASCADE;

-- SECTION 1: FINANCIAL GOALS
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 2.1 College Planning & 2.2 Kids Marriage (stored as JSONB array)
  children JSONB DEFAULT '[]',
  
  -- 2.3 Retirement Planning
  current_age INTEGER,
  retirement_age INTEGER DEFAULT 67,
  years_to_retirement INTEGER,
  retirement_begin_year INTEGER,
  retirement_end_year INTEGER,
  monthly_retirement_income_today DECIMAL(15,2),
  annual_retirement_income_today DECIMAL(15,2),
  annual_retirement_income_pretax DECIMAL(15,2),
  annual_retirement_income_inflation DECIMAL(15,2),
  
  -- Monthly Retirement Expenses
  monthly_groceries DECIMAL(10,2),
  monthly_home_taxes DECIMAL(10,2),
  monthly_hoa DECIMAL(10,2),
  monthly_utilities DECIMAL(10,2),
  monthly_home_insurance DECIMAL(10,2),
  monthly_entertainment DECIMAL(10,2),
  monthly_home_repairs DECIMAL(10,2),
  monthly_maintenance DECIMAL(10,2),
  monthly_car_insurance DECIMAL(10,2),
  total_monthly_expenses DECIMAL(10,2),
  
  -- 2.4 Long Term Care / Medical
  healthcare_philosophy TEXT,
  ltc_years_from_today INTEGER,
  ltc_begin_year INTEGER,
  ltc_end_year INTEGER,
  healthcare_outofpocket_20years DECIMAL(15,2),
  longterm_care_3years DECIMAL(15,2),
  has_ltc_insurance BOOLEAN DEFAULT false,
  
  -- 2.5 Life Goals Planning
  travel_years_from_today INTEGER,
  travel_begin_year INTEGER,
  travel_end_year INTEGER,
  travel_amount DECIMAL(15,2),
  vacation_home_years INTEGER,
  vacation_home_begin_year INTEGER,
  vacation_home_end_year INTEGER,
  vacation_home_amount DECIMAL(15,2),
  charity_years INTEGER,
  charity_begin_year INTEGER,
  charity_end_year INTEGER,
  charity_amount DECIMAL(15,2),
  other_goal_description TEXT,
  other_goal_years INTEGER,
  other_goal_begin_year INTEGER,
  other_goal_end_year INTEGER,
  other_goal_amount DECIMAL(15,2),
  
  -- 2.6 Legacy Planning
  legacy_kids_home_years INTEGER,
  legacy_kids_home_begin_year INTEGER,
  legacy_kids_home_end_year INTEGER,
  legacy_kids_home_amount DECIMAL(15,2),
  legacy_asset_years INTEGER,
  legacy_asset_begin_year INTEGER,
  legacy_asset_end_year INTEGER,
  legacy_asset_amount DECIMAL(15,2),
  special_needs_description TEXT,
  special_needs_years INTEGER,
  special_needs_begin_year INTEGER,
  special_needs_end_year INTEGER,
  special_needs_amount DECIMAL(15,2),
  current_net_worth DECIMAL(15,2),
  projected_net_worth_retirement DECIMAL(15,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- SECTION 2: CURRENT GROWTH STRATEGY (OFFENSIVE)
CREATE TABLE growth_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 3.1 Current 401K/403B
  has_401k_self BOOLEAN DEFAULT false,
  current_401k_balance_self DECIMAL(15,2),
  company_match_percent_self DECIMAL(5,2),
  is_max_funding_self BOOLEAN DEFAULT false,
  present_value_401k_self DECIMAL(15,2),
  projected_value_65_401k_self DECIMAL(15,2),
  
  has_401k_spouse BOOLEAN DEFAULT false,
  current_401k_balance_spouse DECIMAL(15,2),
  company_match_percent_spouse DECIMAL(5,2),
  is_max_funding_spouse BOOLEAN DEFAULT false,
  present_value_401k_spouse DECIMAL(15,2),
  projected_value_65_401k_spouse DECIMAL(15,2),
  
  -- Previous 401K / Rollover
  has_rollover_401k_self BOOLEAN DEFAULT false,
  rollover_401k_balance_self DECIMAL(15,2),
  has_rollover_401k_spouse BOOLEAN DEFAULT false,
  rollover_401k_balance_spouse DECIMAL(15,2),
  
  -- Traditional IRA / SEP-IRA
  has_traditional_ira_self BOOLEAN DEFAULT false,
  traditional_ira_balance_self DECIMAL(15,2),
  has_traditional_ira_spouse BOOLEAN DEFAULT false,
  traditional_ira_balance_spouse DECIMAL(15,2),
  
  -- Roth IRA / Roth 401K
  has_roth_self BOOLEAN DEFAULT false,
  roth_balance_self DECIMAL(15,2),
  has_roth_spouse BOOLEAN DEFAULT false,
  roth_balance_spouse DECIMAL(15,2),
  
  -- HSA/FSA
  has_hsa_self BOOLEAN DEFAULT false,
  hsa_balance_self DECIMAL(15,2),
  hsa_annual_contribution_self DECIMAL(10,2),
  has_hsa_spouse BOOLEAN DEFAULT false,
  hsa_balance_spouse DECIMAL(15,2),
  hsa_annual_contribution_spouse DECIMAL(10,2),
  
  -- Social Security
  ss_monthly_benefit_self DECIMAL(10,2),
  ss_annual_benefit_self DECIMAL(10,2),
  ss_projected_25years_self DECIMAL(15,2),
  ss_monthly_benefit_spouse DECIMAL(10,2),
  ss_annual_benefit_spouse DECIMAL(10,2),
  ss_projected_25years_spouse DECIMAL(15,2),
  
  -- Pension / Annuities
  has_pension_self BOOLEAN DEFAULT false,
  pension_monthly_amount_self DECIMAL(10,2),
  pension_starting_age_self INTEGER,
  has_pension_spouse BOOLEAN DEFAULT false,
  pension_monthly_amount_spouse DECIMAL(10,2),
  pension_starting_age_spouse INTEGER,
  
  -- 3.2 Real Estate (USA)
  owns_primary_home BOOLEAN DEFAULT false,
  primary_home_value DECIMAL(15,2),
  primary_home_purchase_year INTEGER,
  primary_home_purchase_price DECIMAL(15,2),
  primary_home_mortgage_balance DECIMAL(15,2),
  primary_home_monthly_payment DECIMAL(10,2),
  primary_home_interest_rate DECIMAL(5,2),
  primary_home_equity DECIMAL(15,2),
  
  -- Rental Properties (stored as JSONB array)
  rental_properties JSONB DEFAULT '[]',
  
  -- Land Parcels
  has_land_parcels BOOLEAN DEFAULT false,
  land_location TEXT,
  land_value DECIMAL(15,2),
  land_debt DECIMAL(15,2),
  
  -- Inheritance
  expects_inheritance BOOLEAN DEFAULT false,
  inheritance_details TEXT,
  inheritance_estimated_value DECIMAL(15,2),
  inheritance_expected_year INTEGER,
  
  -- 3.3 Stocks / Business / Income (USA)
  has_brokerage_account BOOLEAN DEFAULT false,
  brokerage_stocks DECIMAL(15,2),
  brokerage_mutual_funds DECIMAL(15,2),
  brokerage_bonds DECIMAL(15,2),
  brokerage_etfs DECIMAL(15,2),
  
  -- Business Ownership
  owns_business BOOLEAN DEFAULT false,
  business_name TEXT,
  business_type TEXT,
  business_ownership_percent DECIMAL(5,2),
  business_estimated_value DECIMAL(15,2),
  business_annual_income DECIMAL(15,2),
  
  -- Alternative Investments
  has_alternative_investments BOOLEAN DEFAULT false,
  alternative_investment_type TEXT,
  alternative_investment_value DECIMAL(15,2),
  
  -- CDs
  has_cds BOOLEAN DEFAULT false,
  cd_total_value DECIMAL(15,2),
  cd_interest_rate DECIMAL(5,2),
  cd_maturity_date DATE,
  
  -- Cash
  checking_account DECIMAL(15,2),
  savings_account DECIMAL(15,2),
  emergency_fund DECIMAL(15,2),
  money_market DECIMAL(15,2),
  other_cash DECIMAL(15,2),
  
  -- 3.5 College Planning / Estate
  -- 529 Plans (stored as JSONB array matching children)
  plans_529 JSONB DEFAULT '[]',
  
  -- Estate Planning
  has_will BOOLEAN DEFAULT false,
  will_created_date DATE,
  will_last_updated DATE,
  has_trust BOOLEAN DEFAULT false,
  trust_type TEXT,
  trust_created_date DATE,
  has_healthcare_proxy BOOLEAN DEFAULT false,
  has_power_of_attorney BOOLEAN DEFAULT false,
  has_guardian_designated BOOLEAN DEFAULT false,
  guardian_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- SECTION 3: CURRENT DEFENSE STRATEGY (DEFENSIVE)
CREATE TABLE defense_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 3.4 Family Protection & Insurance
  -- Life Insurance at Work
  has_work_life_self BOOLEAN DEFAULT false,
  work_life_coverage_self DECIMAL(15,2),
  work_life_employer_paid_self BOOLEAN DEFAULT false,
  work_life_monthly_premium_self DECIMAL(10,2),
  
  has_work_life_spouse BOOLEAN DEFAULT false,
  work_life_coverage_spouse DECIMAL(15,2),
  work_life_employer_paid_spouse BOOLEAN DEFAULT false,
  work_life_monthly_premium_spouse DECIMAL(10,2),
  
  -- Life Insurance Outside Work
  has_personal_life_self BOOLEAN DEFAULT false,
  personal_life_type_self TEXT,
  personal_life_coverage_self DECIMAL(15,2),
  personal_life_premium_self DECIMAL(10,2),
  personal_life_start_year_self INTEGER,
  personal_life_expiration_self INTEGER,
  personal_life_provider_self TEXT,
  personal_life_is_cash_value_self BOOLEAN DEFAULT false,
  personal_life_cash_value_self DECIMAL(15,2),
  
  has_personal_life_spouse BOOLEAN DEFAULT false,
  personal_life_type_spouse TEXT,
  personal_life_coverage_spouse DECIMAL(15,2),
  personal_life_premium_spouse DECIMAL(10,2),
  personal_life_start_year_spouse INTEGER,
  personal_life_expiration_spouse INTEGER,
  personal_life_provider_spouse TEXT,
  personal_life_is_cash_value_spouse BOOLEAN DEFAULT false,
  personal_life_cash_value_spouse DECIMAL(15,2),
  
  -- Disability Insurance
  has_work_disability_self BOOLEAN DEFAULT false,
  work_disability_short_term_self BOOLEAN DEFAULT false,
  work_disability_long_term_self BOOLEAN DEFAULT false,
  work_disability_monthly_benefit_self DECIMAL(10,2),
  work_disability_benefit_period_self TEXT,
  
  has_work_disability_spouse BOOLEAN DEFAULT false,
  work_disability_short_term_spouse BOOLEAN DEFAULT false,
  work_disability_long_term_spouse BOOLEAN DEFAULT false,
  work_disability_monthly_benefit_spouse DECIMAL(10,2),
  work_disability_benefit_period_spouse TEXT,
  
  -- Long Term Care
  has_ltc_self BOOLEAN DEFAULT false,
  ltc_monthly_benefit_self DECIMAL(10,2),
  ltc_benefit_period_years_self INTEGER,
  ltc_monthly_premium_self DECIMAL(10,2),
  ltc_provider_self TEXT,
  
  has_ltc_spouse BOOLEAN DEFAULT false,
  ltc_monthly_benefit_spouse DECIMAL(10,2),
  ltc_benefit_period_years_spouse INTEGER,
  ltc_monthly_premium_spouse DECIMAL(10,2),
  ltc_provider_spouse TEXT,
  
  -- Mortgage Protection
  has_mortgage_protection BOOLEAN DEFAULT false,
  mortgage_protection_coverage DECIMAL(15,2),
  mortgage_protection_monthly_premium DECIMAL(10,2),
  mortgage_protection_provider TEXT,
  
  -- Umbrella Insurance
  has_umbrella BOOLEAN DEFAULT false,
  umbrella_coverage DECIMAL(15,2),
  umbrella_annual_premium DECIMAL(10,2),
  umbrella_provider TEXT,
  
  -- DIME Method Calculation
  total_debt DECIMAL(15,2),
  income_x_10 DECIMAL(15,2),
  mortgage_x_10 DECIMAL(15,2),
  education_costs DECIMAL(15,2),
  life_insurance_need_total DECIMAL(15,2),
  life_insurance_gap DECIMAL(15,2),
  
  -- 3.6 & 4.x Foreign Financial Assets (FBAR/FATCA)
  has_foreign_assets BOOLEAN DEFAULT false,
  foreign_countries TEXT,
  currency_exchange_rate DECIMAL(10,4),
  
  -- 4.1 Retirement Plans (Off-Shore)
  foreign_retirement_accounts JSONB DEFAULT '[]',
  
  -- 4.2 Real Estate (Off-Shore)
  foreign_properties JSONB DEFAULT '[]',
  
  -- 4.3 Stocks (Off-Shore)
  foreign_stocks JSONB DEFAULT '[]',
  
  -- 4.4 Bank Accounts (Off-Shore)
  foreign_bank_accounts JSONB DEFAULT '[]',
  
  -- 4.5 Gold/Jewellery (Off-Shore)
  foreign_gold JSONB DEFAULT '[]',
  
  -- FBAR Compliance
  total_foreign_assets_usd DECIMAL(15,2),
  exceeds_fbar_threshold BOOLEAN DEFAULT false,
  fbar_filed_this_year BOOLEAN DEFAULT false,
  fbar_filing_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_strategy ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own financial goals"
  ON financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial goals"
  ON financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial goals"
  ON financial_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own growth strategy"
  ON growth_strategy FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own growth strategy"
  ON growth_strategy FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own growth strategy"
  ON growth_strategy FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own defense strategy"
  ON defense_strategy FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own defense strategy"
  ON defense_strategy FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own defense strategy"
  ON defense_strategy FOR UPDATE
  USING (auth.uid() = user_id);
