-- Remove auth requirement for decision inserts
-- Allow any user to insert decisions (client provides user_id)
DROP POLICY IF EXISTS "Users can insert their own decisions" ON decisions;

CREATE POLICY "Anyone can insert decisions"
  ON decisions
  FOR INSERT
  WITH CHECK (true);
