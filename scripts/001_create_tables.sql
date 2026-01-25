-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client', -- 'client' or 'advisor'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Advisors can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'advisor'
    )
  );

-- Client assessments table
CREATE TABLE IF NOT EXISTS public.client_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'reviewed'
  
  -- Personal Information
  date_of_birth DATE,
  marital_status TEXT,
  number_of_children INTEGER DEFAULT 0,
  children_ages INTEGER[],
  
  -- Income & Expenses
  annual_income NUMERIC(15, 2),
  spouse_annual_income NUMERIC(15, 2),
  monthly_expenses NUMERIC(15, 2),
  monthly_housing_cost NUMERIC(15, 2),
  
  -- Assets
  cash_savings NUMERIC(15, 2),
  checking_balance NUMERIC(15, 2),
  investment_accounts NUMERIC(15, 2),
  retirement_401k NUMERIC(15, 2),
  retirement_ira NUMERIC(15, 2),
  home_value NUMERIC(15, 2),
  other_assets NUMERIC(15, 2),
  
  -- Liabilities
  mortgage_balance NUMERIC(15, 2),
  mortgage_rate NUMERIC(5, 4),
  mortgage_years_remaining INTEGER,
  credit_card_debt NUMERIC(15, 2),
  student_loans NUMERIC(15, 2),
  auto_loans NUMERIC(15, 2),
  other_debts NUMERIC(15, 2),
  
  -- Goals & Risk
  retirement_age INTEGER,
  desired_retirement_income NUMERIC(15, 2),
  risk_tolerance TEXT, -- 'conservative', 'moderate', 'aggressive'
  college_funding_goal NUMERIC(15, 2),
  emergency_fund_months INTEGER DEFAULT 6,
  
  -- Insurance
  current_life_insurance NUMERIC(15, 2),
  current_disability_insurance BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  last_saved_step INTEGER DEFAULT 1,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'submitted', 'reviewed'))
);

-- Enable RLS on assessments
ALTER TABLE public.client_assessments ENABLE ROW LEVEL SECURITY;

-- Assessment policies
CREATE POLICY "Users can view their own assessments"
  ON public.client_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.client_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON public.client_assessments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON public.client_assessments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Advisors can view all assessments"
  ON public.client_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'advisor'
    )
  );

CREATE POLICY "Advisors can update all assessments"
  ON public.client_assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'advisor'
    )
  );

-- Financial analysis results table
CREATE TABLE IF NOT EXISTS public.financial_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Net Worth
  current_net_worth NUMERIC(15, 2),
  projected_net_worth_5y NUMERIC(15, 2),
  projected_net_worth_10y NUMERIC(15, 2),
  projected_net_worth_retirement NUMERIC(15, 2),
  
  -- Life Insurance
  life_insurance_need NUMERIC(15, 2),
  life_insurance_gap NUMERIC(15, 2),
  
  -- College Savings
  college_funding_need NUMERIC(15, 2),
  college_monthly_contribution NUMERIC(15, 2),
  
  -- Retirement
  retirement_corpus_needed NUMERIC(15, 2),
  retirement_gap NUMERIC(15, 2),
  monthly_retirement_savings_needed NUMERIC(15, 2),
  
  -- Tax Optimization
  tax_advantaged_recommendations JSONB,
  
  -- Recommendations
  recommendations JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analyses
ALTER TABLE public.financial_analyses ENABLE ROW LEVEL SECURITY;

-- Analysis policies
CREATE POLICY "Users can view their own analyses"
  ON public.financial_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON public.financial_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advisors can view all analyses"
  ON public.financial_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'advisor'
    )
  );

CREATE POLICY "Advisors can update all analyses"
  ON public.financial_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'advisor'
    )
  );

-- Advisor notes table
CREATE TABLE IF NOT EXISTS public.advisor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.client_assessments(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notes
ALTER TABLE public.advisor_notes ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Advisors can manage their own notes"
  ON public.advisor_notes FOR ALL
  USING (auth.uid() = advisor_id);

CREATE POLICY "Clients can view non-private notes"
  ON public.advisor_notes FOR SELECT
  USING (auth.uid() = client_id AND is_private = FALSE);

-- Create indexes for better performance
CREATE INDEX idx_assessments_user_id ON public.client_assessments(user_id);
CREATE INDEX idx_assessments_status ON public.client_assessments(status);
CREATE INDEX idx_analyses_assessment_id ON public.financial_analyses(assessment_id);
CREATE INDEX idx_notes_client_id ON public.advisor_notes(client_id);
CREATE INDEX idx_notes_advisor_id ON public.advisor_notes(advisor_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.client_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.financial_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.advisor_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
