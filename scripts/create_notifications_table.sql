-- Create notifications table for client notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES expert_comments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'comment', -- 'comment', 'report', 'reminder', etc.
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Advisors can insert notifications for their clients
CREATE POLICY "Advisors can create client notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    advisor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = notifications.user_id
      AND profiles.advisor_id = auth.uid()
    )
  );

-- Advisors can view notifications they created
CREATE POLICY "Advisors can view own notifications"
  ON notifications FOR SELECT
  USING (advisor_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_advisor_id ON notifications(advisor_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Add sent_to_client column to expert_comments
ALTER TABLE expert_comments ADD COLUMN IF NOT EXISTS sent_to_client BOOLEAN DEFAULT FALSE;
