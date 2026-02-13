-- ============================================================
-- Activity Logs (Login/Logout)
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_uuid" uuid REFERENCES "public"."users"("uuid") ON DELETE
    SET NULL,
        "action" text NOT NULL,
        -- 'login', 'logout', 'view_profile', etc.
        "details" jsonb DEFAULT '{}'::jsonb,
        "ip_address" text,
        "user_agent" text,
        "created_at" timestamp with time zone DEFAULT now()
);
-- Enable RLS
ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;
-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON "public"."activity_logs" FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM users
            WHERE uuid = auth.uid()
                AND (
                    role = 'moderator'
                    OR role = 'teacher'
                )
        )
    );
-- System/Trigger can insert logs
CREATE POLICY "Allow log insertion" ON "public"."activity_logs" FOR
INSERT WITH CHECK (true);
-- Indices
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_uuid);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);