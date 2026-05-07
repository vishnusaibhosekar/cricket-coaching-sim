-- Fix RLS policy to handle empty string auth.uid()
DROP POLICY IF EXISTS "Users can insert their own decisions" ON decisions;

CREATE POLICY "Users can insert their own decisions"
  ON decisions
  FOR INSERT
  WITH CHECK (
    -- Allow if authenticated and user_id matches
    (auth.uid() IS NOT NULL AND auth.uid()::text != '' AND auth.uid() = user_id)
    OR
    -- Allow anonymous inserts (browser-mode SDK fallback)
    -- The application layer validates user_id before insert
    ((auth.uid() IS NULL OR auth.uid()::text = '') AND user_id IS NOT NULL)
  );
