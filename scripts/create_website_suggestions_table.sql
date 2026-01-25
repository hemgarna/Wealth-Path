-- Create website suggestions table
CREATE TABLE IF NOT EXISTS public.website_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_role TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('bug', 'suggestion', 'improvement', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.website_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own suggestions
CREATE POLICY "Users can insert own suggestions"
ON public.website_suggestions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: CEOs can view all suggestions
CREATE POLICY "CEOs can view all suggestions"
ON public.website_suggestions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'ceo'
  )
);

-- Policy: CEOs can update suggestions
CREATE POLICY "CEOs can update suggestions"
ON public.website_suggestions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'ceo'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_suggestions_read ON public.website_suggestions(read);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON public.website_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON public.website_suggestions(user_id);
