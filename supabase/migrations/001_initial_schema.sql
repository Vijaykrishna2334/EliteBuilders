-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  github_username TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Challenges table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverables JSONB NOT NULL, -- Array of required deliverables
  rubric JSONB NOT NULL, -- Scoring rubric structure
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone"
  ON challenges FOR SELECT
  USING (status = 'active' OR status = 'closed');

-- Challenge participants (tracking who started which challenge)
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by everyone"
  ON challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can start challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  deck_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scoring', 'scored', 'failed')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, challenge_id) -- One submission per user per challenge (v1)
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions are viewable by everyone"
  ON submissions FOR SELECT
  USING (true);

CREATE POLICY "Users can create own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  rubric_scores JSONB NOT NULL, -- Detailed breakdown by rubric criteria
  repo_analysis TEXT, -- LLM analysis of repo
  deck_analysis TEXT, -- LLM analysis of deck
  video_analysis TEXT, -- LLM analysis of video
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scores are viewable by everyone"
  ON scores FOR SELECT
  USING (true);

-- Reports table (for moderation)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reports viewable by reporter and admins"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Create indexes for performance
CREATE INDEX idx_submissions_challenge_id ON submissions(challenge_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_scores_submission_id ON scores(submission_id);
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user_id ON challenge_participants(user_id);

-- Create view for leaderboard
CREATE VIEW leaderboard AS
SELECT
  s.challenge_id,
  s.user_id,
  p.full_name,
  p.github_username,
  p.avatar_url,
  sc.total_score,
  s.submitted_at,
  s.repo_url,
  s.deck_url,
  s.video_url
FROM submissions s
JOIN profiles p ON s.user_id = p.id
JOIN scores sc ON s.id = sc.submission_id
WHERE s.status = 'scored'
ORDER BY s.challenge_id, sc.total_score DESC, s.submitted_at ASC;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
