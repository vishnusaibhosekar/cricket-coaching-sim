-- Cricket Coaching Simulator Database Setup
-- Run this SQL in your InsForge dashboard to create the decisions table

CREATE TABLE IF NOT EXISTS decisions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  match_id    TEXT NOT NULL,
  over_number INTEGER NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('bowling_change', 'field_placement')),
  user_choice JSONB NOT NULL,
  actual_choice JSONB,
  match_context JSONB NOT NULL,
  merit_score INTEGER,
  merit_breakdown JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_decisions_match_id ON decisions(match_id);
CREATE INDEX IF NOT EXISTS idx_decisions_user_id ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_merit_score ON decisions(merit_score);

-- Enable Row Level Security
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own decisions
CREATE POLICY "Users can insert their own decisions"
  ON decisions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view all decisions (for leaderboard)
CREATE POLICY "Users can view all decisions"
  ON decisions
  FOR SELECT
  USING (true);

-- Policy: Users can update their own decisions (for scoring)
CREATE POLICY "Users can update their own decisions"
  ON decisions
  FOR UPDATE
  USING (auth.uid() = user_id);
