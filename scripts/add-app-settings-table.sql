-- Create app_settings table for global application configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  allow_client_self_registration BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings (self-registration disabled by default)
INSERT INTO app_settings (id, allow_client_self_registration)
VALUES ('global', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Allow CEOs to read and update settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for login page)
CREATE POLICY "Anyone can read app settings" ON app_settings
  FOR SELECT USING (true);

-- Only CEOs can update settings
CREATE POLICY "CEOs can update app settings" ON app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ceo'
    )
  );
