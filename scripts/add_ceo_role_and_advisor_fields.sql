-- Add CEO role support and advisor management fields

-- First, update the role enum to support 'ceo' role
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_supervisor_id ON profiles(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add advisor-specific metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS advisor_status TEXT DEFAULT 'active'; -- 'active', 'inactive'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_clients INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_cases INTEGER DEFAULT 0;

-- Add auto-generated IDs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS advisor_code TEXT; -- e.g., ADV-2025-001
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_advisor_code ON profiles(advisor_code) WHERE advisor_code IS NOT NULL;

-- Update RLS policies for CEO access

-- CEOs can view all profiles
CREATE POLICY "CEOs can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- CEOs can create advisors
CREATE POLICY "CEOs can create advisors"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- CEOs can update advisors
CREATE POLICY "CEOs can update advisors"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- CEOs can delete advisors  
CREATE POLICY "CEOs can delete advisors"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- Advisors can only see their assigned clients
-- (This policy already exists but let's make it explicit)
DROP POLICY IF EXISTS "Advisors can view their assigned clients" ON profiles;
CREATE POLICY "Advisors can view their assigned clients"
  ON profiles FOR SELECT
  USING (
    role = 'client' AND advisor_id = auth.uid()
  );

-- Update client_assessments policies for CEO access
CREATE POLICY "CEOs can view all assessments"
  ON client_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- Update final_report policies for CEO access
CREATE POLICY "CEOs can view all final reports"
  ON final_report FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- Update case_status policies for CEO access
CREATE POLICY "CEOs can view all case statuses"
  ON case_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

CREATE POLICY "CEOs can update all case statuses"
  ON case_status FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ceo'
    )
  );

-- Function to generate advisor code
CREATE OR REPLACE FUNCTION generate_advisor_code()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  sequence_num INTEGER;
  new_code TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(advisor_code FROM 'ADV-\d{4}-(\d{3})') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM profiles
  WHERE advisor_code LIKE 'ADV-' || year || '-%';
  
  new_code := 'ADV-' || year || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate advisor code on insert
CREATE OR REPLACE FUNCTION set_advisor_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'advisor' AND NEW.advisor_code IS NULL THEN
    NEW.advisor_code := generate_advisor_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_advisor_code ON profiles;
CREATE TRIGGER trigger_set_advisor_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_advisor_code();
