-- ============================================================
-- Fix RLS policies for assignment submissions and activity logs
-- Automatically applied via Supabase CLI
-- ============================================================
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Students manage own submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers update submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Anyone can insert logs" ON activity_logs;
DROP POLICY IF EXISTS "Teachers view logs for their assignments" ON activity_logs;
DROP POLICY IF EXISTS "Students view own logs" ON activity_logs;
DROP POLICY IF EXISTS "Teachers manage own assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view active assignments" ON assignments;
-- ============================================================
-- Assignments permissions
-- ============================================================
CREATE POLICY "Authenticated users can view all active assignments" ON assignments FOR
SELECT USING (
        status = 'active'
        OR auth.uid() = teacher_uuid
    );
CREATE POLICY "Teachers manage own assignments" ON assignments FOR ALL USING (auth.uid() = teacher_uuid) WITH CHECK (auth.uid() = teacher_uuid);
-- ============================================================
-- Submissions permissions
-- ============================================================
CREATE POLICY "Students insert own submissions" ON assignment_submissions FOR
INSERT WITH CHECK (auth.uid() = student_uuid);
CREATE POLICY "Students select own submissions" ON assignment_submissions FOR
SELECT USING (auth.uid() = student_uuid);
CREATE POLICY "Students update own submissions" ON assignment_submissions FOR
UPDATE USING (auth.uid() = student_uuid) WITH CHECK (auth.uid() = student_uuid);
CREATE POLICY "Teachers view submissions for their assignments" ON assignment_submissions FOR
SELECT USING (
        assignment_id IN (
            SELECT id
            FROM assignments
            WHERE teacher_uuid = auth.uid()
        )
    );
CREATE POLICY "Teachers update submissions for their assignments" ON assignment_submissions FOR
UPDATE USING (
        assignment_id IN (
            SELECT id
            FROM assignments
            WHERE teacher_uuid = auth.uid()
        )
    );
-- ============================================================
-- Activity logs permissions
-- ============================================================
CREATE POLICY "Authenticated users insert logs" ON activity_logs FOR
INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers view logs for their assignments" ON activity_logs FOR
SELECT USING (
        assignment_id IN (
            SELECT id
            FROM assignments
            WHERE teacher_uuid = auth.uid()
        )
    );
CREATE POLICY "Students view own logs" ON activity_logs FOR
SELECT USING (auth.uid() = student_uuid);