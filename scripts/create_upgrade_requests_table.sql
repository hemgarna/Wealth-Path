-- Create upgrade requests table
CREATE TABLE IF NOT EXISTS public.upgrade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL DEFAULT 'organization_upgrade',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
  message TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Advisors can view their own requests
CREATE POLICY "Advisors can view their own upgrade requests"
ON public.upgrade_requests
FOR SELECT
TO authenticated
USING (advisor_id = auth.uid());

-- Advisors can create requests
CREATE POLICY "Advisors can create upgrade requests"
ON public.upgrade_requests
FOR INSERT
TO authenticated
WITH CHECK (advisor_id = auth.uid() AND status = 'PENDING');

-- CEOs can view all requests
CREATE POLICY "CEOs can view all upgrade requests"
ON public.upgrade_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ceo'
  )
);

-- CEOs can update requests
CREATE POLICY "CEOs can update upgrade requests"
ON public.upgrade_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ceo'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_advisor_id ON public.upgrade_requests(advisor_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_requests_status ON public.upgrade_requests(status);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_upgrade_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER upgrade_requests_updated_at
BEFORE UPDATE ON public.upgrade_requests
FOR EACH ROW
EXECUTE FUNCTION update_upgrade_requests_updated_at();
