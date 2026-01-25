-- Drop existing tables and recreate with comprehensive fields
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS growth_strategy CASCADE;
DROP TABLE IF EXISTS defense_strategy CASCADE;

-- SECTION 1: FINANCIAL GOALS
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 2.1 College Planning (stored as JSONB array)
  children JSONB DEFAULT '[]',
  
  -- 2.2 Kids Marriage Planning (part of children JSONB)
  
  -- 2.3 Retirement Planning
  retirement_age INTEGER,
  years_to_retirement INTEGER,
  retirement_begin_year INTEGER,
  retirement_end_year INTEGER,
  monthly_retirement_income_today NUMERIC(12,2),
  annual_retirement_income_today NUMERIC(12,2),
  annual_retirement_income_pretax NUMERIC(12,2),
  annual_retirement_income_inflation NUMERIC(12,2),
  
  -- Monthly Retirement Expenses
  monthly_groceries NUMERIC(10,2),
  monthly_home_taxes NUMERIC(10,2),
  monthly_hoa NUMERIC(10,2),
  monthly_utilities NUMERIC(10,2),
  monthly_home_insurance NUMERIC(10,2),
  monthly_entertainment NUMERIC(10,2),
  monthly_home_repairs NUMERIC(10,2),
  monthly_maintenance NUMERIC(10,2),
  monthly_car_insurance NUMERIC(10,2),
  total_monthly_expenses NUMERIC(10,2),
  
  -- 2.4 Long Term Care / Medical
  healthcare_philosophy TEXT,
  ltc_years_from_today INTEGER,
  ltc_begin_year INTEGER,
  ltc_end_year INTEGER,
  healthcare_out_of_pocket NUMERIC(12,2),
  long_term_care_cost NUMERIC(12,2),
  has_ltc_insurance BOOLEAN DEFAULT false,
  
  -- 2.5 Life Goals Planning
  travel_years_from_today INTEGER,
  travel_begin_year INTEGER,
  travel_end_year INTEGER,
  travel_amount NUMERIC(12,2),
  vacation_home_years_from_today INTEGER,
  vacation_home_begin_year INTEGER,
  vacation_home_end_year INTEGER,
  vacation_home_amount NUMERIC(12,2),
  charity_years_from_today INTEGER,
  charity_begin_year INTEGER,
  charity_end_year INTEGER,
  charity_annual NUMERIC(12,2),
  other_goal_description TEXT,
  other_goal_years_from_today INTEGER,
  other_goal_begin_year INTEGER,
  other_goal_end_year INTEGER,
  other_goal_amount NUMERIC(12,2),
  
  -- 2.6 Legacy Planning
  kids_home_fund_years_from_today INTEGER,
  kids_home_fund_begin_year INTEGER,
  kids_home_fund_end_year INTEGER,
  kids_home_fund_amount NUMERIC(12,2),
  legacy_asset_years_from_today INTEGER,
  legacy_asset_begin_year INTEGER,
  legacy_asset_end_year INTEGER,
  legacy_amount NUMERIC(12,2),
  special_needs_description TEXT,
  special_needs_years_from_today INTEGER,
  special_needs_begin_year INTEGER,
  special_needs_end_year INTEGER,
  special_needs_amount NUMERIC(12,2),
  total_current_net_worth NUMERIC(15,2),
  total_projected_net_worth_at_retirement NUMERIC(15,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 2: CURRENT GROWTH STRATEGY (USA - CURRENT POSITION)
CREATE TABLE growth_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 3.1 RETIREMENT PLANNING (USA)
  -- Current 401k/403b (Yours)
  has_401k BOOLEAN DEFAULT false,
  current_401k_balance NUMERIC(12,2),
  company_match_percent NUMERIC(5,2),
  is_max_funding_401k BOOLEAN DEFAULT false,
  notes_401k TEXT,
  pv_401k NUMERIC(12,2),
  fv_401k_at_65 NUMERIC(12,2),
  income_stream_401k_25yrs NUMERIC(12,2),
  
  -- Spouse 401k/403b
  spouse_has_401k BOOLEAN DEFAULT false,
  spouse_401k_balance NUMERIC(12,2),
  spouse_company_match_percent NUMERIC(5,2),
  spouse_is_max_funding_401k BOOLEAN DEFAULT false,
  spouse_notes_401k TEXT,
  spouse_pv_401k NUMERIC(12,2),
  spouse_fv_401k_at_65 NUMERIC(12,2),
  spouse_income_stream_401k_25yrs NUMERIC(12,2),
  
  -- Previous/Rollover 401k (Yours)
  has_rollover_401k BOOLEAN DEFAULT false,
  rollover_401k_balance NUMERIC(12,2),
  notes_rollover_401k TEXT,
  pv_rollover_401k NUMERIC(12,2),
  fv_rollover_401k_at_65 NUMERIC(12,2),
  
  -- Spouse Previous/Rollover 401k
  spouse_has_rollover_401k BOOLEAN DEFAULT false,
  spouse_rollover_401k_balance NUMERIC(12,2),
  spouse_notes_rollover_401k TEXT,
  spouse_pv_rollover_401k NUMERIC(12,2),
  spouse_fv_rollover_401k_at_65 NUMERIC(12,2),
  
  -- Traditional IRA/SEP-IRA (Yours)
  has_traditional_ira BOOLEAN DEFAULT false,
  traditional_ira_balance NUMERIC(12,2),
  notes_traditional_ira TEXT,
  pv_traditional_ira NUMERIC(12,2),
  fv_traditional_ira_at_65 NUMERIC(12,2),
  
  -- Spouse Traditional IRA/SEP-IRA
  spouse_has_traditional_ira BOOLEAN DEFAULT false,
  spouse_traditional_ira_balance NUMERIC(12,2),
  spouse_notes_traditional_ira TEXT,
  spouse_pv_traditional_ira NUMERIC(12,2),
  spouse_fv_traditional_ira_at_65 NUMERIC(12,2),
  
  -- Roth IRA/Roth 401k (Yours)
  has_roth BOOLEAN DEFAULT false,
  roth_balance NUMERIC(12,2),
  notes_roth TEXT,
  pv_roth NUMERIC(12,2),
  fv_roth_at_65 NUMERIC(12,2),
  
  -- Spouse Roth IRA/Roth 401k
  spouse_has_roth BOOLEAN DEFAULT false,
  spouse_roth_balance NUMERIC(12,2),
  spouse_notes_roth TEXT,
  spouse_pv_roth NUMERIC(12,2),
  spouse_fv_roth_at_65 NUMERIC(12,2),
  
  -- HSA/FSA (Yours)
  has_hsa BOOLEAN DEFAULT false,
  hsa_balance NUMERIC(12,2),
  hsa_annual_contribution NUMERIC(10,2),
  notes_hsa TEXT,
  pv_hsa NUMERIC(12,2),
  fv_hsa_at_65 NUMERIC(12,2),
  
  -- Spouse HSA/FSA
  spouse_has_hsa BOOLEAN DEFAULT false,
  spouse_hsa_balance NUMERIC(12,2),
  spouse_hsa_annual_contribution NUMERIC(10,2),
  spouse_notes_hsa TEXT,
  spouse_pv_hsa NUMERIC(12,2),
  spouse_fv_hsa_at_65 NUMERIC(12,2),
  
  -- Social Security (Yours)
  social_security_monthly_benefit NUMERIC(10,2),
  social_security_annual_benefit NUMERIC(12,2),
  notes_social_security TEXT,
  social_security_income_25yrs NUMERIC(12,2),
  
  -- Spouse Social Security
  spouse_social_security_monthly_benefit NUMERIC(10,2),
  spouse_social_security_annual_benefit NUMERIC(12,2),
  spouse_notes_social_security TEXT,
  spouse_social_security_income_25yrs NUMERIC(12,2),
  combined_social_security NUMERIC(12,2),
  
  -- Pension/Annuities (Yours)
  has_pension BOOLEAN DEFAULT false,
  pension_monthly_amount NUMERIC(10,2),
  pension_starting_age INTEGER,
  notes_pension TEXT,
  pv_pension NUMERIC(12,2),
  fv_pension_at_65 NUMERIC(12,2),
  
  -- Spouse Pension/Annuities
  spouse_has_pension BOOLEAN DEFAULT false,
  spouse_pension_monthly_amount NUMERIC(10,2),
  spouse_pension_starting_age INTEGER,
  spouse_notes_pension TEXT,
  spouse_pv_pension NUMERIC(12,2),
  spouse_fv_pension_at_65 NUMERIC(12,2),
  
  -- 3.2 REAL ESTATE INVESTMENTS (USA)
  -- Personal Home Equity
  owns_primary_home BOOLEAN DEFAULT false,
  home_current_value NUMERIC(12,2),
  home_purchase_year INTEGER,
  home_purchase_price NUMERIC(12,2),
  home_mortgage_balance NUMERIC(12,2),
  home_monthly_payment NUMERIC(10,2),
  home_interest_rate NUMERIC(5,2),
  home_equity NUMERIC(12,2),
  notes_primary_home TEXT,
  pv_home NUMERIC(12,2),
  fv_home_at_65 NUMERIC(12,2),
  
  -- Rental Properties (stored as JSONB array)
  rental_properties JSONB DEFAULT '[]',
  
  -- Land Parcels
  owns_land BOOLEAN DEFAULT false,
  land_location TEXT,
  land_current_value NUMERIC(12,2),
  land_debt NUMERIC(12,2),
  notes_land TEXT,
  pv_land NUMERIC(12,2),
  fv_land_at_65 NUMERIC(12,2),
  
  -- Inheritance USA
  expects_inheritance BOOLEAN DEFAULT false,
  inheritance_property_details TEXT,
  inheritance_estimated_value NUMERIC(12,2),
  inheritance_expected_year INTEGER,
  notes_inheritance TEXT,
  pv_inheritance NUMERIC(12,2),
  fv_inheritance_at_65 NUMERIC(12,2),
  
  -- 3.3 STOCKS / BUSINESS / INCOME (USA)
  -- Taxable Brokerage Account
  has_brokerage_account BOOLEAN DEFAULT false,
  brokerage_stocks NUMERIC(12,2),
  brokerage_mutual_funds NUMERIC(12,2),
  brokerage_bonds NUMERIC(12,2),
  brokerage_etfs NUMERIC(12,2),
  brokerage_total NUMERIC(12,2),
  notes_brokerage TEXT,
  pv_brokerage NUMERIC(12,2),
  fv_brokerage_at_65 NUMERIC(12,2),
  
  -- Business Ownership
  owns_business BOOLEAN DEFAULT false,
  business_name TEXT,
  business_type TEXT,
  business_ownership_percent NUMERIC(5,2),
  business_estimated_value NUMERIC(12,2),
  business_annual_income NUMERIC(12,2),
  notes_business TEXT,
  pv_business NUMERIC(12,2),
  fv_business_at_65 NUMERIC(12,2),
  
  -- Alternative Investments
  has_alternative_investments BOOLEAN DEFAULT false,
  alternative_investment_type TEXT,
  alternative_current_value NUMERIC(12,2),
  notes_alternative TEXT,
  pv_alternative NUMERIC(12,2),
  fv_alternative_at_65 NUMERIC(12,2),
  
  -- Certificate of Deposits
  has_cds BOOLEAN DEFAULT false,
  cd_total_value NUMERIC(12,2),
  cd_interest_rate NUMERIC(5,2),
  cd_maturity_date DATE,
  notes_cd TEXT,
  pv_cd NUMERIC(12,2),
  fv_cd_at_65 NUMERIC(12,2),
  
  -- Cash in Bank + Emergency Fund
  checking_account NUMERIC(12,2),
  savings_account NUMERIC(12,2),
  emergency_fund NUMERIC(12,2),
  money_market_account NUMERIC(12,2),
  other_cash NUMERIC(12,2),
  total_cash NUMERIC(12,2),
  notes_cash TEXT,
  pv_cash NUMERIC(12,2),
  fv_cash_at_65 NUMERIC(12,2),
  
  -- 3.5 COLLEGE PLANNING / ESTATE PLANNING
  -- 529 Plans (stored as JSONB array for each child)
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
  notes_estate_planning TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 3: CURRENT DEFENSE STRATEGY (PROTECTIVE)
CREATE TABLE defense_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 3.4 FAMILY PROTECTION & INSURANCE
  -- Life Insurance at Work (Yours)
  has_employer_life_insurance BOOLEAN DEFAULT false,
  employer_life_coverage NUMERIC(12,2),
  employer_life_paid_by_employer BOOLEAN DEFAULT false,
  employer_life_monthly_premium NUMERIC(10,2),
  notes_employer_life TEXT,
  pv_employer_life NUMERIC(12,2),
  fv_employer_life NUMERIC(12,2),
  
  -- Spouse Life Insurance at Work
  spouse_has_employer_life BOOLEAN DEFAULT false,
  spouse_employer_life_coverage NUMERIC(12,2),
  spouse_employer_life_paid_by_employer BOOLEAN DEFAULT false,
  spouse_employer_life_monthly_premium NUMERIC(10,2),
  spouse_notes_employer_life TEXT,
  spouse_pv_employer_life NUMERIC(12,2),
  spouse_fv_employer_life NUMERIC(12,2),
  
  -- Personal Life Insurance (Yours)
  has_personal_life_insurance BOOLEAN DEFAULT false,
  personal_life_policy_type TEXT,
  personal_life_coverage NUMERIC(12,2),
  personal_life_premium NUMERIC(10,2),
  personal_life_start_year INTEGER,
  personal_life_expiration INTEGER,
  personal_life_provider TEXT,
  notes_personal_life TEXT,
  is_cash_value_life BOOLEAN DEFAULT false,
  cash_value_life_amount NUMERIC(12,2),
  cash_value_life_company TEXT,
  cash_value_life_years_held INTEGER,
  pv_personal_life NUMERIC(12,2),
  fv_personal_life NUMERIC(12,2),
  
  -- Spouse Personal Life Insurance
  spouse_has_personal_life BOOLEAN DEFAULT false,
  spouse_personal_life_policy_type TEXT,
  spouse_personal_life_coverage NUMERIC(12,2),
  spouse_personal_life_premium NUMERIC(10,2),
  spouse_personal_life_start_year INTEGER,
  spouse_personal_life_expiration INTEGER,
  spouse_personal_life_provider TEXT,
  spouse_notes_personal_life TEXT,
  spouse_is_cash_value_life BOOLEAN DEFAULT false,
  spouse_cash_value_life_amount NUMERIC(12,2),
  spouse_cash_value_life_company TEXT,
  spouse_cash_value_life_years_held INTEGER,
  spouse_pv_personal_life NUMERIC(12,2),
  spouse_fv_personal_life NUMERIC(12,2),
  
  -- Disability Insurance (Yours)
  has_disability_insurance BOOLEAN DEFAULT false,
  has_short_term_disability BOOLEAN DEFAULT false,
  has_long_term_disability BOOLEAN DEFAULT false,
  disability_monthly_benefit NUMERIC(10,2),
  disability_benefit_period TEXT,
  notes_disability TEXT,
  
  -- Spouse Disability Insurance
  spouse_has_disability_insurance BOOLEAN DEFAULT false,
  spouse_has_short_term_disability BOOLEAN DEFAULT false,
  spouse_has_long_term_disability BOOLEAN DEFAULT false,
  spouse_disability_monthly_benefit NUMERIC(10,2),
  spouse_disability_benefit_period TEXT,
  spouse_notes_disability TEXT,
  
  -- Long Term Care (Yours)
  has_ltc_insurance BOOLEAN DEFAULT false,
  ltc_monthly_benefit NUMERIC(10,2),
  ltc_benefit_period INTEGER,
  ltc_monthly_premium NUMERIC(10,2),
  ltc_provider TEXT,
  notes_ltc TEXT,
  
  -- Spouse Long Term Care
  spouse_has_ltc_insurance BOOLEAN DEFAULT false,
  spouse_ltc_monthly_benefit NUMERIC(10,2),
  spouse_ltc_benefit_period INTEGER,
  spouse_ltc_monthly_premium NUMERIC(10,2),
  spouse_ltc_provider TEXT,
  spouse_notes_ltc TEXT,
  
  -- Mortgage Protection Insurance
  has_mortgage_protection BOOLEAN DEFAULT false,
  mortgage_protection_coverage NUMERIC(12,2),
  mortgage_protection_monthly_premium NUMERIC(10,2),
  mortgage_protection_provider TEXT,
  notes_mortgage_protection TEXT,
  
  -- Umbrella Insurance
  has_umbrella_insurance BOOLEAN DEFAULT false,
  umbrella_coverage NUMERIC(12,2),
  umbrella_annual_premium NUMERIC(10,2),
  umbrella_provider TEXT,
  notes_umbrella TEXT,
  
  -- DIME Calculation
  dime_debt NUMERIC(12,2),
  dime_income_x10 NUMERIC(12,2),
  dime_mortgage_x10 NUMERIC(12,2),
  dime_education NUMERIC(12,2),
  dime_total_need NUMERIC(12,2),
  current_total_life_coverage NUMERIC(12,2),
  life_insurance_gap NUMERIC(12,2),
  recommended_term_life_you NUMERIC(12,2),
  recommended_term_life_spouse NUMERIC(12,2),
  
  -- 3.6 FOREIGN FINANCIAL ASSETS (FBAR/FATCA)
  has_foreign_assets BOOLEAN DEFAULT false,
  foreign_countries TEXT,
  currency_exchange_rate NUMERIC(10,4),
  
  -- Foreign Retirement Plans
  has_foreign_retirement BOOLEAN DEFAULT false,
  foreign_retirement_type TEXT,
  foreign_retirement_country TEXT,
  foreign_retirement_account_number TEXT,
  foreign_retirement_value_local NUMERIC(12,2),
  foreign_retirement_value_usd NUMERIC(12,2),
  notes_foreign_retirement TEXT,
  
  -- Foreign Pension
  has_foreign_pension BOOLEAN DEFAULT false,
  foreign_pension_type TEXT,
  foreign_pension_country TEXT,
  foreign_pension_monthly_local NUMERIC(10,2),
  foreign_pension_monthly_usd NUMERIC(10,2),
  foreign_pension_starting_age INTEGER,
  notes_foreign_pension TEXT,
  
  -- Foreign Real Estate (stored as JSONB array)
  foreign_real_estate JSONB DEFAULT '[]',
  
  -- Foreign Rental Income
  receives_foreign_rental_income BOOLEAN DEFAULT false,
  foreign_rental_monthly_local NUMERIC(10,2),
  foreign_rental_monthly_usd NUMERIC(10,2),
  foreign_rental_annual_usd NUMERIC(12,2),
  notes_foreign_rental TEXT,
  
  -- Foreign Business
  owns_foreign_business BOOLEAN DEFAULT false,
  foreign_business_name TEXT,
  foreign_business_type TEXT,
  foreign_business_country TEXT,
  foreign_business_ownership_percent NUMERIC(5,2),
  foreign_business_value_local NUMERIC(12,2),
  foreign_business_value_usd NUMERIC(12,2),
  foreign_business_annual_income NUMERIC(12,2),
  notes_foreign_business TEXT,
  
  -- Foreign Inheritance
  has_foreign_inheritance BOOLEAN DEFAULT false,
  foreign_inheritance_details TEXT,
  foreign_inheritance_location TEXT,
  foreign_inheritance_country TEXT,
  foreign_inheritance_value_local NUMERIC(12,2),
  foreign_inheritance_value_usd NUMERIC(12,2),
  foreign_inheritance_year INTEGER,
  notes_foreign_inheritance TEXT,
  
  -- Foreign Stocks/Bonds
  has_foreign_stocks BOOLEAN DEFAULT false,
  foreign_stocks_platform TEXT,
  foreign_stocks_country TEXT,
  foreign_stocks_value_local NUMERIC(12,2),
  foreign_stocks_value_usd NUMERIC(12,2),
  notes_foreign_stocks TEXT,
  
  -- Foreign Mutual Funds/ETFs
  has_foreign_mutual_funds BOOLEAN DEFAULT false,
  foreign_mutual_funds_names TEXT,
  foreign_mutual_funds_country TEXT,
  foreign_mutual_funds_value_local NUMERIC(12,2),
  foreign_mutual_funds_value_usd NUMERIC(12,2),
  notes_foreign_mutual_funds TEXT,
  
  -- Foreign Fixed Deposits (stored as JSONB array)
  foreign_fixed_deposits JSONB DEFAULT '[]',
  
  -- Foreign Bank Accounts (stored as JSONB array)
  foreign_bank_accounts JSONB DEFAULT '[]',
  
  -- Foreign Gold/Silver/Jewelry
  has_foreign_gold BOOLEAN DEFAULT false,
  foreign_gold_grams NUMERIC(10,2),
  foreign_gold_value_usd NUMERIC(12,2),
  foreign_silver_grams NUMERIC(10,2),
  foreign_silver_value_usd NUMERIC(12,2),
  foreign_jewelry_value_usd NUMERIC(12,2),
  foreign_locker_value_usd NUMERIC(12,2),
  foreign_gold_country TEXT,
  notes_foreign_gold TEXT,
  total_foreign_gold_value NUMERIC(12,2),
  
  -- Foreign Life Insurance
  has_foreign_life_insurance BOOLEAN DEFAULT false,
  foreign_life_insurance JSONB DEFAULT '[]',
  
  -- Foreign Health Insurance
  has_foreign_health_insurance BOOLEAN DEFAULT false,
  foreign_health_company TEXT,
  foreign_health_country TEXT,
  foreign_health_coverage NUMERIC(12,2),
  foreign_health_annual_premium NUMERIC(10,2),
  notes_foreign_health TEXT,
  
  -- Foreign Estate Planning
  has_foreign_will BOOLEAN DEFAULT false,
  foreign_will_country TEXT,
  foreign_will_created_date DATE,
  foreign_will_last_updated DATE,
  has_foreign_trust BOOLEAN DEFAULT false,
  foreign_trust_type TEXT,
  foreign_trust_country TEXT,
  notes_foreign_estate TEXT,
  
  -- Foreign Emergency Funding
  has_foreign_emergency_fund BOOLEAN DEFAULT false,
  foreign_emergency_cash_home NUMERIC(10,2),
  foreign_emergency_cash_friends NUMERIC(10,2),
  foreign_emergency_other NUMERIC(10,2),
  foreign_emergency_country TEXT,
  notes_foreign_emergency TEXT,
  total_foreign_emergency NUMERIC(12,2),
  
  -- Other Foreign Investments
  has_other_foreign_investments BOOLEAN DEFAULT false,
  other_foreign_description TEXT,
  other_foreign_country TEXT,
  other_foreign_value_local NUMERIC(12,2),
  other_foreign_value_usd NUMERIC(12,2),
  notes_other_foreign TEXT,
  
  -- FBAR Compliance
  total_foreign_assets_usd NUMERIC(15,2),
  has_filed_fbar BOOLEAN DEFAULT false,
  fbar_last_year_filed INTEGER,
  fbar_years_filed INTEGER,
  fbar_years_noncompliance INTEGER,
  aware_of_fbar_requirements BOOLEAN DEFAULT false,
  needs_fbar_assistance BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_strategy ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own financial_goals"
  ON financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial_goals"
  ON financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial_goals"
  ON financial_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own growth_strategy"
  ON growth_strategy FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own growth_strategy"
  ON growth_strategy FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own growth_strategy"
  ON growth_strategy FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own defense_strategy"
  ON defense_strategy FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own defense_strategy"
  ON defense_strategy FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own defense_strategy"
  ON defense_strategy FOR UPDATE
  USING (auth.uid() = user_id);
