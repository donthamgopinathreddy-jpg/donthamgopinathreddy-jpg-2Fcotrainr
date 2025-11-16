# Training & Nutrition Hub - Setup Instructions

## Quick Start

The Training & Nutrition Hub is now fully implemented and ready to use! Follow these steps to complete the setup.

## Step 1: Access the Feature

The page is available at:

```
/training-hub
```

Navigate to it in your app after logging in.

## Step 2: Set Subscription Plan (Optional but Recommended)

To test the different subscription tiers, you need to set the `subscription_plan` field in your user profile:

### Option A: Via Database

Update the `profiles` table:

```sql
UPDATE profiles
SET subscription_plan = 'free' -- or 'basic', 'premium'
WHERE id = 'your-user-id';
```

### Option B: Via App

The `subscription_plan` field is automatically read from the user profile. When syncing subscription status from the `subscriptions` table, update the profile accordingly.

## Step 3: Create Database Tables (Highly Recommended)

To fully utilize the feature, create these tables in Supabase:

### 1. Create Workouts Table

```sql
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level VARCHAR(50) NOT NULL,
  duration_minutes INT NOT NULL,
  calories_burned INT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT category_check CHECK (category IN ('gym', 'yoga', 'boxing', 'zumba', 'stretching', 'warmups')),
  CONSTRAINT level_check CHECK (level IN ('basic', 'intermediate', 'advanced'))
);

-- Add some sample data
INSERT INTO workouts (title, category, level, duration_minutes, calories_burned, thumbnail_url, description)
VALUES
  ('Beginner Push-ups', 'gym', 'basic', 10, 50, 'https://images.unsplash.com/photo-1584680694062-28dc7ccd49ff?w=400&h=300&fit=crop', 'Learn proper form for push-ups'),
  ('Intermediate Circuit Training', 'gym', 'intermediate', 30, 250, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop', 'Full body circuit training'),
  ('Advanced HIIT', 'gym', 'advanced', 20, 300, 'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=300&fit=crop', 'High intensity interval training'),
  ('Beginner Yoga', 'yoga', 'basic', 15, 80, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop', 'Foundational yoga poses');
```

### 2. Create Diet Preferences Table

```sql
CREATE TABLE IF NOT EXISTS diet_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  goal VARCHAR(50),
  diet_type VARCHAR(50),
  likes TEXT[],
  dislikes TEXT[],
  allergies TEXT[],
  target_calories INT,
  meals_per_day INT,
  budget INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT goal_check CHECK (goal IN ('lose_fat', 'build_muscle', 'maintain')),
  CONSTRAINT diet_type_check CHECK (diet_type IN ('veg', 'non_veg', 'vegan'))
);

-- Enable RLS
ALTER TABLE diet_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own diet preferences"
  ON diet_preferences FOR ALL
  USING (auth.uid() = user_id);
```

### 3. Create Diet Plans Table

```sql
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  plan_type VARCHAR(50),
  macros JSONB,
  budget INT,
  weekly_plan JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own diet plans"
  ON diet_plans FOR ALL
  USING (auth.uid() = user_id OR auth.uid() = created_by);
```

### 4. Create Diet Review Requests Table

```sql
CREATE TABLE IF NOT EXISTS diet_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES auth.users(id),
  diet_plan_id UUID NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  trainer_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT status_check CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE diet_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own review requests"
  ON diet_review_requests FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can create their own review requests"
  ON diet_review_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trainers can update review requests"
  ON diet_review_requests FOR UPDATE
  USING (auth.uid() = trainer_id);
```

### 5. Update Profiles Table (if not already done)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';

-- Add check constraint
ALTER TABLE profiles ADD CONSTRAINT subscription_plan_check
CHECK (subscription_plan IN ('free', 'basic', 'premium'));
```

## Step 4: How to Test

### Testing Free Plan

```sql
UPDATE profiles SET subscription_plan = 'free' WHERE id = 'your-user-id';
```

You should see:

- Only basic workouts available
- Diet Planner locked
- Trend graphs locked
- AI Insights locked

### Testing Basic Plan

```sql
UPDATE profiles SET subscription_plan = 'basic' WHERE id = 'your-user-id';
```

You should see:

- All workout levels available
- Diet Planner unlocked (basic fields only)
- Trend Graphs unlocked
- AI Insights still locked
- Premium diet features locked

### Testing Premium Plan

```sql
UPDATE profiles SET subscription_plan = 'premium' WHERE id = 'your-user-id';
```

You should see:

- All features unlocked
- Full Diet Planner with allergens, macros, budget
- AI Insights visible
- Ask Trainer to Review button available

## Step 5: Features Overview

### What's Included

1. **Subscription Banner** - Shows current tier and benefits
2. **Workout System** - 6 categories × 3 levels = 18 workout combinations
3. **Diet Planner** - Progressive unlocking based on subscription
4. **AI Insights** - Premium-only AI-powered coaching tips
5. **Trend Graphs** - Visual representation of health metrics
6. **Ask Trainer Review** - Premium feature to request trainer feedback

### Files Created

```
client/
├── hooks/
│   ├── useWorkouts.ts
│   ├── useDietPreferences.ts
│   └── useDietReviewRequests.ts
├── components/
│   ├── SubscriptionBanner.tsx
│   └── WorkoutCard.tsx
├── pages/
│   └── TrainingHub.tsx
└── App.tsx (updated with route)

contexts/
└── AuthContext.tsx (updated with subscription_plan field)

Documentation/
├── TRAINING_HUB_GUIDE.md
├── SETUP_INSTRUCTIONS.md (this file)
```

## Step 6: Customization

### Add More Workouts

Insert into the workouts table:

```sql
INSERT INTO workouts (title, category, level, duration_minutes, calories_burned, thumbnail_url, description)
VALUES ('Your Workout', 'gym', 'basic', 20, 100, 'https://...', 'Description');
```

### Change Colors

Edit `client/pages/TrainingHub.tsx`:

- Primary orange: Search for `from-orange-500 to-red-500`
- Replace with your preferred gradient

### Add More Allergens

Edit the allergens section in `TrainingHub.tsx`:

```typescript
const allergensList = [
  "dairy",
  "gluten",
  "nuts",
  "soy",
  "eggs",
  "shellfish",
  "wheat",
  "lactose",
];
```

## Step 7: Navigation Integration (Optional)

Add a link to Training Hub in your navigation:

```typescript
<a href="/training-hub" className="...">Training & Nutrition Hub</a>
```

## Known Features

✅ **Fully Implemented:**

- Subscription-aware feature gating
- Glassmorphic UI with animations
- Responsive design (mobile-first)
- Dark mode support
- Demo data fallback
- All sections and components

✅ **Ready for Integration:**

- API endpoints for diet preferences
- Trainer review request system
- Trend graph data fetching

⏳ **Future Enhancements:**

- Real-time health data integration
- AI-powered insights generation
- Wearable device synchronization
- Advanced analytics dashboard

## Troubleshooting

### Page shows "Free Plan" for everyone

**Solution:** Check if `subscription_plan` field is set in profiles table. Update it:

```sql
UPDATE profiles SET subscription_plan = 'basic' WHERE subscription_plan IS NULL;
```

### Workouts not loading

**Solution:**

1. Check if workouts table exists
2. Verify Supabase connection
3. The page will fall back to demo data if table doesn't exist

### Diet Planner fields not visible

**Solution:**

1. Ensure `subscription_plan` is set to 'basic' or 'premium'
2. Clear browser cache and reload
3. Check browser console for errors

### Styles not applying

**Solution:**

1. Ensure Tailwind CSS is properly configured
2. Rebuild the project: `pnpm run build:client`
3. Check for CSS conflicts

## Next Steps

1. ✅ Access `/training-hub` in your app
2. ✅ Create the Supabase tables (optional but recommended)
3. ✅ Set your subscription plan to test different tiers
4. ✅ Add custom workouts and diet plans
5. ✅ Integrate with your trainer system
6. ✅ Deploy to production

## Support

For detailed information about each feature, see:

- **Feature Guide:** `TRAINING_HUB_GUIDE.md`
- **Code Documentation:** Inline comments in source files
- **API Reference:** See each hook file for detailed documentation

Enjoy your new Training & Nutrition Hub! 🚀
