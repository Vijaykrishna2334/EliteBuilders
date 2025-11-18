-- Add roles and enhanced features to the platform

-- User roles enum
CREATE TYPE user_role AS ENUM ('builder', 'sponsor', 'judge', 'admin');

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'builder';
ALTER TABLE profiles ADD COLUMN company_name TEXT;
ALTER TABLE profiles ADD COLUMN cv_url TEXT;
ALTER TABLE profiles ADD COLUMN linkedin_url TEXT;

-- Seasons table for career scoring
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Challenge categories
CREATE TABLE challenge_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add category and sponsor info to challenges
ALTER TABLE challenges ADD COLUMN category_id UUID REFERENCES challenge_categories(id);
ALTER TABLE challenges ADD COLUMN sponsor_id UUID REFERENCES profiles(id);
ALTER TABLE challenges ADD COLUMN prize_amount INTEGER;
ALTER TABLE challenges ADD COLUMN prize_currency TEXT DEFAULT 'USD';
ALTER TABLE challenges ADD COLUMN data_pack_url TEXT;
ALTER TABLE challenges ADD COLUMN season_id UUID REFERENCES seasons(id);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('top_percent', 'category_winner', 'sponsor_favorite', 'streak', 'participation', 'career_score')),
  criteria_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User badges (awarded badges)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id, challenge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

-- Judge reviews table
CREATE TABLE judge_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  rubric_scores JSONB,
  is_sponsor_favorite BOOLEAN DEFAULT false,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(submission_id, judge_id)
);

ALTER TABLE judge_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Judge reviews are viewable by everyone"
  ON judge_reviews FOR SELECT
  USING (true);

CREATE POLICY "Judges can create reviews"
  ON judge_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'judge' OR role = 'admin' OR role = 'sponsor')
    )
  );

-- Update scores table to include hybrid scoring
ALTER TABLE scores ADD COLUMN llm_score INTEGER;
ALTER TABLE scores ADD COLUMN judge_score INTEGER;
ALTER TABLE scores ADD COLUMN final_score INTEGER;
ALTER TABLE scores ADD COLUMN score_type TEXT DEFAULT 'llm' CHECK (score_type IN ('llm', 'judge', 'hybrid'));

-- Rename total_score to maintain compatibility
ALTER TABLE scores RENAME COLUMN total_score TO llm_score;
ALTER TABLE scores ADD COLUMN total_score INTEGER GENERATED ALWAYS AS (
  COALESCE(final_score, judge_score, llm_score)
) STORED;

-- Career scores (cumulative across seasons)
CREATE TABLE career_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id),
  total_score INTEGER NOT NULL DEFAULT 0,
  challenges_completed INTEGER NOT NULL DEFAULT 0,
  avg_score DECIMAL(5,2),
  rank INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, season_id)
);

ALTER TABLE career_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Career scores are viewable by everyone"
  ON career_scores FOR SELECT
  USING (true);

-- Email notifications queue
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON email_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_judge_reviews_submission_id ON judge_reviews(submission_id);
CREATE INDEX idx_career_scores_season_id ON career_scores(season_id);
CREATE INDEX idx_career_scores_rank ON career_scores(rank);
CREATE INDEX idx_challenges_category_id ON challenges(category_id);
CREATE INDEX idx_challenges_sponsor_id ON challenges(sponsor_id);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);

-- Function to update career scores
CREATE OR REPLACE FUNCTION update_career_score(p_user_id UUID, p_season_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_score INTEGER;
  v_challenges_completed INTEGER;
  v_avg_score DECIMAL(5,2);
BEGIN
  -- Calculate stats
  SELECT
    COALESCE(SUM(sc.total_score), 0),
    COUNT(DISTINCT s.challenge_id),
    COALESCE(AVG(sc.total_score), 0)
  INTO v_total_score, v_challenges_completed, v_avg_score
  FROM submissions s
  JOIN scores sc ON s.id = sc.submission_id
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.user_id = p_user_id
    AND s.status = 'scored'
    AND (p_season_id IS NULL OR c.season_id = p_season_id);

  -- Upsert career score
  INSERT INTO career_scores (user_id, season_id, total_score, challenges_completed, avg_score)
  VALUES (p_user_id, p_season_id, v_total_score, v_challenges_completed, v_avg_score)
  ON CONFLICT (user_id, season_id)
  DO UPDATE SET
    total_score = v_total_score,
    challenges_completed = v_challenges_completed,
    avg_score = v_avg_score,
    updated_at = NOW();

  -- Update rankings
  WITH ranked_scores AS (
    SELECT
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_score DESC, avg_score DESC) as new_rank
    FROM career_scores
    WHERE season_id IS NOT DISTINCT FROM p_season_id
  )
  UPDATE career_scores cs
  SET rank = rs.new_rank
  FROM ranked_scores rs
  WHERE cs.user_id = rs.user_id
    AND cs.season_id IS NOT DISTINCT FROM p_season_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update career scores after scoring
CREATE OR REPLACE FUNCTION trigger_update_career_score()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_season_id UUID;
BEGIN
  -- Get user and season
  SELECT s.user_id, c.season_id
  INTO v_user_id, v_season_id
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  WHERE s.id = NEW.submission_id;

  -- Update career score
  PERFORM update_career_score(v_user_id, v_season_id);
  PERFORM update_career_score(v_user_id, NULL); -- Overall career score

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_score_insert
  AFTER INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_career_score();

-- Function to auto-award badges
CREATE OR REPLACE FUNCTION auto_award_badges(p_submission_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_challenge_id UUID;
  v_season_id UUID;
  v_score INTEGER;
  v_rank INTEGER;
  v_total_submissions INTEGER;
  v_badge RECORD;
BEGIN
  -- Get submission details
  SELECT s.user_id, s.challenge_id, c.season_id, sc.total_score
  INTO v_user_id, v_challenge_id, v_season_id, v_score
  FROM submissions s
  JOIN challenges c ON s.challenge_id = c.id
  JOIN scores sc ON s.id = sc.submission_id
  WHERE s.id = p_submission_id;

  -- Get rank and total submissions for this challenge
  SELECT
    rank_num,
    total_count
  INTO v_rank, v_total_submissions
  FROM (
    SELECT
      s2.id,
      ROW_NUMBER() OVER (ORDER BY sc2.total_score DESC, s2.submitted_at ASC) as rank_num,
      COUNT(*) OVER () as total_count
    FROM submissions s2
    JOIN scores sc2 ON s2.id = sc2.submission_id
    WHERE s2.challenge_id = v_challenge_id AND s2.status = 'scored'
  ) ranked
  WHERE id = p_submission_id;

  -- Award top 10% badge
  IF v_rank <= GREATEST(1, v_total_submissions * 0.1) THEN
    INSERT INTO user_badges (user_id, badge_id, challenge_id, season_id)
    SELECT v_user_id, id, v_challenge_id, v_season_id
    FROM badges
    WHERE criteria_type = 'top_percent'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Award category winner (rank 1)
  IF v_rank = 1 THEN
    INSERT INTO user_badges (user_id, badge_id, challenge_id, season_id)
    SELECT v_user_id, id, v_challenge_id, v_season_id
    FROM badges
    WHERE criteria_type = 'category_winner'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Award sponsor favorite (if marked by judge)
  IF EXISTS (
    SELECT 1 FROM judge_reviews
    WHERE submission_id = p_submission_id AND is_sponsor_favorite = true
  ) THEN
    INSERT INTO user_badges (user_id, badge_id, challenge_id, season_id)
    SELECT v_user_id, id, v_challenge_id, v_season_id
    FROM badges
    WHERE criteria_type = 'sponsor_favorite'
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-award badges after scoring
CREATE OR REPLACE FUNCTION trigger_auto_award_badges()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auto_award_badges(NEW.submission_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_score_award_badges
  AFTER INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_award_badges();

-- Enhanced leaderboard view with badges
CREATE OR REPLACE VIEW leaderboard_enhanced AS
SELECT
  s.challenge_id,
  s.user_id,
  p.full_name,
  p.github_username,
  p.avatar_url,
  sc.total_score,
  sc.llm_score,
  sc.judge_score,
  sc.score_type,
  s.submitted_at,
  s.repo_url,
  s.deck_url,
  s.video_url,
  ROW_NUMBER() OVER (PARTITION BY s.challenge_id ORDER BY sc.total_score DESC, s.submitted_at ASC) as rank,
  COUNT(*) OVER (PARTITION BY s.challenge_id) as total_participants,
  (
    SELECT json_agg(json_build_object('name', b.name, 'icon', b.icon))
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = s.user_id AND ub.challenge_id = s.challenge_id
  ) as badges
FROM submissions s
JOIN profiles p ON s.user_id = p.id
JOIN scores sc ON s.id = sc.submission_id
WHERE s.status = 'scored'
ORDER BY s.challenge_id, sc.total_score DESC, s.submitted_at ASC;

-- Seed default badges
INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES
('Top 10%', 'Ranked in the top 10% of challenge participants', '🏆', 'top_percent', '{"threshold": 0.1}'::jsonb),
('Challenge Winner', 'First place in a challenge', '🥇', 'category_winner', '{}'::jsonb),
('Sponsor Favorite', 'Selected as sponsor favorite', '⭐', 'sponsor_favorite', '{}'::jsonb),
('3-Challenge Streak', 'Completed 3 challenges in a row', '🔥', 'streak', '{"count": 3}'::jsonb),
('Active Participant', 'Completed 5+ challenges', '📊', 'participation', '{"count": 5}'::jsonb),
('Career Top 100', 'Ranked in top 100 overall career score', '💎', 'career_score', '{"rank": 100}'::jsonb);

-- Seed default categories
INSERT INTO challenge_categories (name, description, icon) VALUES
('AI/ML Engineering', 'Machine learning and AI system challenges', '🤖'),
('LLM Applications', 'Large language model application development', '💬'),
('Data Engineering', 'Data pipeline and infrastructure challenges', '📊'),
('Full-Stack AI', 'End-to-end AI product development', '🚀'),
('AI Research', 'Novel AI research and experimentation', '🔬'),
('AI for Good', 'Social impact and ethical AI applications', '❤️');

-- Create default season
INSERT INTO seasons (name, start_date, end_date, status) VALUES
('Season 1 - 2025', '2025-01-01', '2025-12-31', 'active');
