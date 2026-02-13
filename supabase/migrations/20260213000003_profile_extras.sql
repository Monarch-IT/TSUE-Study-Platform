-- ============================================================
-- Profile Enhancements (Avatar, Age, Bio, Ban Status)
-- ============================================================
ALTER TABLE "public"."users"
ADD COLUMN IF NOT EXISTS "avatar_url" text,
    ADD COLUMN IF NOT EXISTS "age" integer,
    ADD COLUMN IF NOT EXISTS "bio" text,
    ADD COLUMN IF NOT EXISTS "is_banned" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "last_active_at" timestamp with time zone DEFAULT now();
-- Update RLS: Users can update their own avatar, age, and bio
DROP POLICY IF EXISTS "Users can update own metadata" ON users;
CREATE POLICY "Users can update own metadata" ON "public"."users" FOR
UPDATE USING (auth.uid() = uuid) WITH CHECK (
        auth.uid() = uuid
        AND (
            -- Protect critical fields from being changed by the user themselves
            -- Only mods/admins should change roles or ban status
            role IS NOT DISTINCT
            FROM (
                    SELECT role
                    FROM users
                    WHERE uuid = auth.uid()
                )
                AND is_banned IS NOT DISTINCT
            FROM (
                    SELECT is_banned
                    FROM users
                    WHERE uuid = auth.uid()
                )
        )
    );
-- Admin control over ban status
CREATE POLICY "Admins can update anything" ON "public"."users" FOR
UPDATE USING (
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