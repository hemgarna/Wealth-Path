-- Create advisor-specific analysis tables that mirror client forms
-- These tables store the advisor's edited versions without modifying client data

CREATE TABLE IF NOT EXISTS advisor_financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_form_id UUID REFERENCES financial_goals(id),
  -- Mirror all fields from financial_goals
  children JSONB,
  current_age INTEGER,
  retirement_age INTEGER,
  years_to_retirement INTEGER,
  special_needs_description TEXT,
  retirement_begin_year INTEGER,
  retirement_end_year INTEGER,
  monthly_retirement_income_today NUMERIC,
  annual_retirement_income_today NUMERIC,
  annual_retirement_income_pretax NUMERIC,
  annual_retirement_income_inflation NUMERIC,
  total_monthly_expenses NUMERIC,
  -- ... (include all other fields from financial_goals)
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, advisor_id)
);

CREATE TABLE IF NOT EXISTS advisor_growth_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_form_id UUID REFERENCES growth_strategy(id),
  -- Mirror all fields from growth_strategy
  has_401k_self BOOLEAN,
  current_401k_balance_self NUMERIC,
  company_match_percent_self NUMERIC,
  -- ... (include all other fields)
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, advisor_id)
);

CREATE TABLE IF NOT EXISTS advisor_defense_strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_form_id UUID REFERENCES defense_strategy(id),
  -- Mirror all fields from defense_strategy
  has_work_life_self BOOLEAN,
  work_life_coverage_self NUMERIC,
  -- ... (include all other fields)
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, advisor_id)
);

CREATE TABLE IF NOT EXISTS advisor_savings_vs_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_form_id UUID REFERENCES savings_vs_spending(id),
  -- Mirror all fields from savings_vs_spending
  annual_gross_income NUMERIC,
  federal_tax NUMERIC,
  net_monthly_income NUMERIC,
  -- ... (include all other fields)
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, advisor_id)
);

CREATE TABLE IF NOT EXISTS advisor_final_report (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_report_id UUID REFERENCES final_report(id),
  -- Mirror all fields from final_report
  current_age INTEGER,
  retirement_age INTEGER,
  years_to_retirement INTEGER,
  total_retirement_now NUMERIC,
  total_retirement_at_67 NUMERIC,
  -- ... (include all other fields)
  advisor_notes TEXT,
  advisor_recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, advisor_id)
);

-- Enable RLS
ALTER TABLE advisor_financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_growth_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_defense_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_savings_vs_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_final_report ENABLE ROW LEVEL SECURITY;

-- Create policies for advisors to access their own analyses
CREATE POLICY "Advisors can view their own analyses" ON advisor_financial_goals FOR SELECT USING (advisor_id = auth.uid());
CREATE POLICY "Advisors can insert their own analyses" ON advisor_financial_goals FOR INSERT WITH CHECK (advisor_id = auth.uid());
CREATE POLICY "Advisors can update their own analyses" ON advisor_financial_goals FOR UPDATE USING (advisor_id = auth.uid());

CREATE POLICY "Advisors can view their own analyses" ON advisor_growth_strategy FOR SELECT USING (advisor_id = auth.uid());
CREATE POLICY "Advisors can insert their own analyses" ON advisor_growth_strategy FOR INSERT WITH CHECK (advisor_id = auth.uid());
CREATE POLICY "Advisors can update their own analyses" ON advisor_growth_strategy FOR UPDATE USING (advisor_id = auth.uid());

CREATE POLICY "Advisors can view their own analyses" ON advisor_defense_strategy FOR SELECT USING (advisor_id = auth.uid());
CREATE POLICY "Advisors can insert their own analyses" ON advisor_defense_strategy FOR INSERT WITH CHECK (advisor_id = auth.uid());
CREATE POLICY "Advisors can update their own analyses" ON advisor_defense_strategy FOR UPDATE USING (advisor_id = auth.uid());

CREATE POLICY "Advisors can view their own analyses" ON advisor_savings_vs_spending FOR SELECT USING (advisor_id = auth.uid());
CREATE POLICY "Advisors can insert their own analyses" ON advisor_savings_vs_spending FOR INSERT WITH CHECK (advisor_id = auth.uid());
CREATE POLICY "Advisors can update their own analyses" ON advisor_savings_vs_spending FOR UPDATE USING (advisor_id = auth.uid());

CREATE POLICY "Advisors can view their own analyses" ON advisor_final_report FOR SELECT USING (advisor_id = auth.uid());
CREATE POLICY "Advisors can insert their own analyses" ON advisor_final_report FOR INSERT WITH CHECK (advisor_id = auth.uid());
CREATE POLICY "Advisors can update their own analyses" ON advisor_final_report FOR UPDATE USING (advisor_id = auth.uid());
