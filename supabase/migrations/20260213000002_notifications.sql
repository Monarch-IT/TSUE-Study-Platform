-- ============================================================
-- Notification System
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_uuid" uuid NOT NULL REFERENCES "public"."users"("uuid") ON DELETE CASCADE,
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text DEFAULT 'info',
    -- 'info', 'task', 'grade', 'alert'
    "is_read" boolean DEFAULT false,
    "link" text,
    -- Optional link to a specific task or page
    "created_at" timestamp with time zone DEFAULT now()
);
-- Enable RLS
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
-- Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR
SELECT USING (auth.uid() = user_uuid);
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR
UPDATE USING (auth.uid() = user_uuid);
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR
INSERT WITH CHECK (true);
-- Allow service role or anyone for now, can be tightened later
-- Indices
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_uuid);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_uuid)
WHERE is_read = false;