-- Drop existing complex tables and create simplified schema
DROP TABLE IF EXISTS advisor_notes CASCADE;
DROP TABLE IF EXISTS financial_analyses CASCADE;
DROP TABLE IF EXISTS client_assessments CASCADE;

-- Update profiles table to remove phone
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- Create simplified client questionnaire table
CREATE TABLE IF NOT EXISTS client_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Financial Goals
  financial_goals TEXT[],
  kids_college_planning BOOLEAN DEFAULT false,
  retirement_planning BOOLEAN DEFAULT false,
  other_goals TEXT,
  
  -- Additional Responsibilities
  additional_responsibilities TEXT,
  
  -- Current Position
  current_annual_income DECIMAL(12, 2),
  monthly_expenses DECIMAL(12, 2),
  current_savings DECIMAL(12, 2),
  current_debt DECIMAL(12, 2),
  
  -- Offensive Strategy
  retirement_accounts JSONB DEFAULT '[]'::jsonb, -- [{type, balance, contribution}]
  real_estate_accounts JSONB DEFAULT '[]'::jsonb, -- [{type, value, equity}]
  investment_accounts JSONB DEFAULT '[]'::jsonb, -- [{type, balance, return_rate}]
  
  -- Defensive Strategy
  life_insurance_coverage DECIMAL(12, 2),
  disability_insurance BOOLEAN DEFAULT false,
  emergency_fund_months INTEGER,
  estate_planning_complete BOOLEAN DEFAULT false,
  
  -- Metadata
  status VARCHAR(20) DEFAULT 'draft', -- draft, completed
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE client_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own questionnaire"
  ON client_questionnaires FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questionnaire"
  ON client_questionnaires FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaire"
  ON client_questionnaires FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Advisors can view all questionnaires"
  ON client_questionnaires FOR SELECT
  USING (is_advisor());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_questionnaires_updated_at
  BEFORE UPDATE ON client_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
