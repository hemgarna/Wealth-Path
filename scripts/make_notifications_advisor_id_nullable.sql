-- Make advisor_id nullable in notifications table since not all notifications are advisor-specific
ALTER TABLE public.notifications ALTER COLUMN advisor_id DROP NOT NULL;
