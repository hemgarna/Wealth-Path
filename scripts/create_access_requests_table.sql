-- Create access requests table for clients requesting access
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_email TEXT NOT NULL,
  client_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- CEOs can view all requests
CREATE POLICY "CEOs can view all access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ceo'
  )
);

-- CEOs can update requests
CREATE POLICY "CEOs can update access requests"
ON public.access_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ceo'
  )
);

-- Anyone can create access requests (before authentication)
CREATE POLICY "Anyone can create access requests"
ON public.access_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.access_requests(client_email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION update_access_requests_updated_at();
