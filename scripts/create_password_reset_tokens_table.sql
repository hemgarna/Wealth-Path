-- Create password reset tokens table for custom reset flow
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Allow anyone to read valid tokens (they'll need the token to access anyway)
CREATE POLICY "Anyone can read password reset tokens"
ON public.password_reset_tokens
FOR SELECT
TO anon, authenticated
USING (expires_at > NOW() AND used = FALSE);
