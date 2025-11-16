# Training & Nutrition Hub - Supabase Setup

## Overview
The Training Hub requires several Supabase tables to store workout data, diet preferences, and diet review requests. This guide explains the required tables and how to set them up.

## Required Tables

### 1. `workouts` Table
**Purpose:** Store all available workouts across different categories and levels

```sql
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gym', 'yoga', 'boxing', 'zumba', 'stretching', 'warmups')),
  level TEXT NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced')),
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workouts_category ON workouts(category);
CREATE INDEX idx_workouts_level ON workouts(level);
```

**Sample Data:**
```sql
INSERT INTO workouts (title, category, level, duration_minutes, calories_burned, description) VALUES
('Beginner Push-ups', 'gym', 'basic', 10, 50, 'Learn proper form for push-ups'),
('Intermediate Circuit Training', 'gym', 'intermediate', 30, 250, 'Full body circuit training'),
('Advanced HIIT', 'gym', 'advanced', 20, 300, 'High intensity interval training'),
('Beginner Yoga', 'yoga', 'basic', 15, 80, 'Foundational yoga poses'),
('Vinyasa Flow', 'yoga', 'intermediate', 45, 150, 'Dynamic yoga flow'),
-- Add more as needed
```

### 2. `diet_preferences` Table
**Purpose:** Store user's dietary preferences and restrictions

```sql
CREATE TABLE public.diet_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT CHECK (goal IN ('lose_fat', 'build_muscle', 'maintain')),
  diet_type TEXT CHECK (diet_type IN ('veg', 'non_veg', 'vegan')),
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  target_calories INTEGER,
  meals_per_day INTEGER,
  budget INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_diet_preferences_user_id ON diet_preferences(user_id);
```

### 3. `diet_plans` Table
**Purpose:** Store generated or user-created diet plans

```sql
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  plan_type TEXT CHECK (plan_type IN ('weekly', 'custom')),
  macros JSONB,
  budget INTEGER,
  weekly_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diet_plans_user_id ON diet_plans(user_id);
```

### 4. `diet_review_requests` Table
**Purpose:** Store requests for trainers to review diet plans

```sql
CREATE TABLE public.diet_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id),
  diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  trainer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_diet_review_requests_user_id ON diet_review_requests(user_id);
CREATE INDEX idx_diet_review_requests_trainer_id ON diet_review_requests(trainer_id);
CREATE INDEX idx_diet_review_requests_status ON diet_review_requests(status);
```

### 5. Update `profiles` Table
**Purpose:** Add subscription_plan column if it doesn't exist

```sql
-- Add if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium'));
```

## Row-Level Security (RLS) Policies

### For `diet_preferences`:
```sql
-- Users can only view/edit their own preferences
ALTER TABLE diet_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet preferences"
ON diet_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own diet preferences"
ON diet_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet preferences"
ON diet_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### For `diet_plans`:
```sql
-- Users can view plans created for them or by trainers
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diet plans"
ON diet_plans FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Users can create own diet plans"
ON diet_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trainers can update plans they created"
ON diet_plans FOR UPDATE
USING (auth.uid() = created_by);
```

### For `diet_review_requests`:
```sql
-- Users can view their requests, trainers can view requests assigned to them
ALTER TABLE diet_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own review requests"
ON diet_review_requests FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can create own review requests"
ON diet_review_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trainers can update assigned reviews"
ON diet_review_requests FOR UPDATE
USING (auth.uid() = trainer_id);
```

## Setup Instructions

1. **Copy the SQL** from the sections above into your Supabase SQL editor
2. **Execute** each section in order (tables first, then RLS policies)
3. **Verify** the tables were created by checking the Supabase Tables view
4. **Insert sample data** for workouts if desired
5. **Test** the application to ensure data is being saved/retrieved correctly

## Testing

After setup, you can:
1. Navigate to `/training-hub` in the app
2. Test with different subscription plans (free/basic/premium)
3. Try saving diet preferences
4. Submit trainer review requests
5. Check Supabase to confirm data was saved

## Demo Mode Fallback

The app has built-in demo data fallback in the hooks. If tables don't exist:
- Workouts will show demo data
- Diet preferences will use mock data
- Review requests will still attempt to save to DB

This allows testing the UI before setting up the database.
