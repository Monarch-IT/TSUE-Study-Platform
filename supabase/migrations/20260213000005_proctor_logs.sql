-- ============================================================
-- Proctor Logs (Exam Integrity Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS "public"."proctor_logs" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "uuid" uuid REFERENCES "public"."users"("uuid") ON DELETE CASCADE,
    "type" text NOT NULL,
    -- 'tab_switch', 'blur', etc.
    "task_id" text,
    "timestamp" bigint,
    "count" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT now()
);
-- Enable RLS
ALTER TABLE "public"."proctor_logs" ENABLE ROW LEVEL SECURITY;
-- Admins and Teachers can view proctor logs
CREATE POLICY "Admins and Teachers can view all proctor logs" ON "public"."proctor_logs" FOR
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
-- Anyone (students during exam) can insert logs
CREATE POLICY "Allow proctor log insertion" ON "public"."proctor_logs" FOR
INSERT WITH CHECK (true);
-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_proctor_logs_user ON proctor_logs(uuid);
CREATE INDEX IF NOT EXISTS idx_proctor_logs_task ON proctor_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_proctor_logs_created ON proctor_logs(created_at DESC);