-- Allow anonymous inserts for browser-mode SDK
-- This policy allows inserts when user_id is set, even without auth context
-- Security: Application code must validate user_id matches the authenticated user

DROP POLICY IF EXISTS "Users can insert their own decisions" ON decisions;

CREATE POLICY "Users can insert their own decisions"
  ON decisions
  FOR INSERT
  WITH CHECK (
    -- Allow if authenticated and user_id matches
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR
    -- Allow anonymous inserts (browser-mode SDK fallback)
    -- The application layer validates user_id before insert
    (auth.uid() IS NULL AND user_id IS NOT NULL)
  );
