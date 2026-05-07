-- User Profiles Table for Cricket Coaching Simulator
-- This table stores user leaderboard stats and profile information from OAuth

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  total_decisions INTEGER DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_points ON user_profiles(total_points DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all profiles (for leaderboard)
CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at trigger
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();
