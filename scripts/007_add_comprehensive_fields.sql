-- Add comprehensive fields to client_assessments table

-- College Planning
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS college_child1_age INTEGER,
ADD COLUMN IF NOT EXISTS college_child1_years_from_today INTEGER,
ADD COLUMN IF NOT EXISTS college_child1_begin_year INTEGER,
ADD COLUMN IF NOT EXISTS college_child1_end_year INTEGER,
ADD COLUMN IF NOT EXISTS college_child1_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS college_child2_age INTEGER,
ADD COLUMN IF NOT EXISTS college_child2_years_from_today INTEGER,
ADD COLUMN IF NOT EXISTS college_child2_begin_year INTEGER,
ADD COLUMN IF NOT EXISTS college_child2_end_year INTEGER,
ADD COLUMN IF NOT EXISTS college_child2_amount NUMERIC(15, 2);

-- Marriage Planning
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS marriage_child1_years_from_today INTEGER,
ADD COLUMN IF NOT EXISTS marriage_child1_year INTEGER,
ADD COLUMN IF NOT EXISTS marriage_child1_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS marriage_child2_years_from_today INTEGER,
ADD COLUMN IF NOT EXISTS marriage_child2_year INTEGER,
ADD COLUMN IF NOT EXISTS marriage_child2_amount NUMERIC(15, 2);

-- Retirement (some already exist, add missing ones)
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS retirement_years_from_today INTEGER,
ADD COLUMN IF NOT EXISTS monthly_retirement_income_today NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS annual_retirement_income_today NUMERIC(15, 2);

-- Long Term Care
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS healthcare_out_of_pocket_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS long_term_care_amount NUMERIC(15, 2);

-- Life Goals
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS life_goals_travel TEXT,
ADD COLUMN IF NOT EXISTS life_goals_vacation_home TEXT,
ADD COLUMN IF NOT EXISTS life_goals_charity TEXT,
ADD COLUMN IF NOT EXISTS life_goals_other TEXT;

-- Legacy
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS legacy_kids_home_business BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS legacy_assets_for_family BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS legacy_special_needs TEXT;

-- 401k and Retirement Accounts
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS has_401k_him BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_401k_her BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_401k_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS company_match_him NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS company_match_her NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS max_funding_401k_him BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_funding_401k_her BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS projected_401k_at_65 NUMERIC(15, 2);

ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS has_traditional_ira BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS traditional_ira_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_roth_ira BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS roth_ira_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_hsa BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hsa_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS social_security_projected NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_pension BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pension_value NUMERIC(15, 2);

-- Real Estate
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS has_personal_home BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS personal_home_equity NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_rental_properties BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rental_properties_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS rental_income_monthly NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_land_parcels BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS land_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_usa_inheritance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS usa_inheritance_value NUMERIC(15, 2);

-- Stocks & Business
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS has_stocks_outside_401k BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stocks_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS owns_business BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS business_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_alternative_investments BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alternative_investments_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_cds BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cds_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS cash_in_bank NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS emergency_fund NUMERIC(15, 2);

-- Insurance (some exist, add missing)
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS life_insurance_work_him NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS life_insurance_work_her NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS life_insurance_outside_him NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS life_insurance_outside_her NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS is_cash_value_life_insurance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS life_insurance_company TEXT,
ADD COLUMN IF NOT EXISTS has_disability_insurance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_long_term_care_insurance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_mortgage_protection BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_umbrella_insurance BOOLEAN DEFAULT FALSE;

-- Estate Planning
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS has_529_plans BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS plan_529_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS has_will_and_trust BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS estate_planning_updated_year INTEGER;

-- Monthly Budget
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS monthly_net_pay NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS monthly_mortgage_rent NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS monthly_retirement_savings NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS monthly_lifestyle NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS monthly_short_term_savings NUMERIC(15, 2);

-- Foreign Assets (FBAR/FATCA)
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS offshore_retirement_funds NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_pension NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_real_estate_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_rental_income NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_business_value NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_inheritance NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_stocks NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_mutual_funds NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_fixed_deposits NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_savings_accounts NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_gold_silver NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_life_insurance NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_health_insurance NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_emergency_fund NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS offshore_other_investments NUMERIC(15, 2);

-- Calculated totals
ALTER TABLE public.client_assessments
ADD COLUMN IF NOT EXISTS total_fbar_amount NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS total_foreign_networth NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS total_usa_networth NUMERIC(15, 2),
ADD COLUMN IF NOT EXISTS total_networth NUMERIC(15, 2);

-- Update status to support 'completed' status
ALTER TABLE public.client_assessments
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE public.client_assessments
ADD CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'reviewed', 'completed'));
