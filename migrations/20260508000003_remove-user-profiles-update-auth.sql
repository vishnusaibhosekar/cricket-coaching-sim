-- Allow anonymous updates to user_profiles
-- Required for browser-mode SDK to update profile stats
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Anyone can update profiles"
  ON user_profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
