-- Create conversion tracking table for funnel analytics
CREATE TABLE IF NOT EXISTS public.conversion_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'landing_page_view',
    'signup',
    'started_questionnaire',
    'step1_complete',
    'step2_complete',
    'step3_complete',
    'step4_complete',
    'consultation_booked'
  )),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_user_id ON public.conversion_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_advisor_id ON public.conversion_tracking(advisor_id);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_event_type ON public.conversion_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_created_at ON public.conversion_tracking(created_at);

-- Enable RLS
ALTER TABLE public.conversion_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "CEOs can view all conversion tracking"
  ON public.conversion_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ceo'
    )
  );

CREATE POLICY "Advisors can view their clients' conversion tracking"
  ON public.conversion_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'advisor'
      AND conversion_tracking.advisor_id = profiles.id
    )
  );

CREATE POLICY "System can insert conversion tracking"
  ON public.conversion_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
