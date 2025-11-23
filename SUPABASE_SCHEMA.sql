-- ============================================
-- CoTrainr Database Schema
-- ============================================

-- 1. Users & Profiles Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'trainer', 'admin')),
  height_cm FLOAT,
  weight_kg FLOAT,
  bmi FLOAT GENERATED ALWAYS AS (
    CASE WHEN height_cm > 0 THEN ROUND(weight_kg / ((height_cm / 100) ^ 2), 1) ELSE NULL END
  ) STORED,
  bmi_status VARCHAR(50) GENERATED ALWAYS AS (
    CASE 
      WHEN bmi < 18.5 THEN 'Underweight'
      WHEN bmi >= 18.5 AND bmi < 25 THEN 'Normal'
      WHEN bmi >= 25 AND bmi < 30 THEN 'Overweight'
      ELSE 'Obese'
    END
  ) STORED,
  subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  subscription_status VARCHAR(50) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  coins_balance INTEGER DEFAULT 0,
  verified_trainer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- 2. Daily Stats Table
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  water_intake_ml INTEGER DEFAULT 0,
  distance_km FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

-- 3. Meals Logs Table
CREATE TABLE IF NOT EXISTS meals_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  calories INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meals_logs_user_date ON meals_logs(user_id, date);

-- 4. Trainers Table
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  years_experience INTEGER,
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  location_lat FLOAT,
  location_lng FLOAT,
  rating FLOAT DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  meeting_link VARCHAR(500),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meetings_trainer ON meetings(trainer_id);
CREATE INDEX idx_meetings_client ON meetings(client_id);
CREATE INDEX idx_meetings_status ON meetings(status);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- 7. Community Feed Tables
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- 8. Achievements Tables
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  required_value INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress_value INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS rewards_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  coins INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_rewards_events_user ON rewards_events(user_id);
CREATE INDEX idx_rewards_events_created ON rewards_events(created_at);

-- 9. Referrals & Subscriptions
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(referrer_id, referred_user_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  razorpay_subscription_id VARCHAR(255),
  plan_name VARCHAR(100) NOT NULL CHECK (plan_name IN ('basic', 'premium')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  started_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  id_document_url VARCHAR(500),
  selfie_url VARCHAR(500),
  certificate_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_trainer_verifications_trainer ON trainer_verifications(trainer_id);

-- 10. Messaging Tables
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_p1 ON conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- Enable RLS & Create Policies
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies (allow read all, update own)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Daily stats policies
CREATE POLICY "Users can view own stats" ON daily_stats FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own stats" ON daily_stats FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own stats" ON daily_stats FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Feed policies (public read, auth write)
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Meetings (restrict to participants)
CREATE POLICY "Users can view own meetings" ON meetings FOR SELECT USING (auth.uid()::text = trainer_id::text OR auth.uid()::text = client_id::text);
CREATE POLICY "Trainers can create meetings" ON meetings FOR INSERT WITH CHECK (auth.uid()::text = trainer_id::text);
