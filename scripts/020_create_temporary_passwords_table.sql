-- Create a table to store temporary passwords for reference
-- Note: This is for administrative purposes only and should be handled securely

CREATE TABLE IF NOT EXISTS temporary_passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  temporary_password text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_temp_passwords_user_id ON temporary_passwords(user_id);
CREATE INDEX IF NOT EXISTS idx_temp_passwords_email ON temporary_passwords(email);
CREATE INDEX IF NOT EXISTS idx_temp_passwords_created_by ON temporary_passwords(created_by);

-- Enable RLS
ALTER TABLE temporary_passwords ENABLE ROW LEVEL SECURITY;

-- Only CEOs and Advisors can view temporary passwords
CREATE POLICY "CEOs can view all temporary passwords"
  ON temporary_passwords FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ceo'
    )
  );

CREATE POLICY "Advisors can view their clients' temporary passwords"
  ON temporary_passwords FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
      AND profiles.id = temporary_passwords.created_by
    )
  );

-- Only CEOs and Advisors can insert
CREATE POLICY "CEOs and Advisors can insert temporary passwords"
  ON temporary_passwords FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ceo', 'advisor')
    )
  );

COMMENT ON TABLE temporary_passwords IS 'Stores temporary passwords for new accounts. For administrative reference only.';
