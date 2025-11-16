# Training & Nutrition Hub - Complete Feature Guide

## Overview

The Training & Nutrition Hub is a subscription-aware, feature-rich page that provides users with a complete fitness and wellness management system. It includes workout recommendations, personalized diet planning, AI-powered insights, and health trend tracking - all gated by subscription tier.

## Features by Subscription Tier

### Free Plan
- ✅ View basic-level workouts only
- ✅ Basic meal tracking
- ❌ Intermediate/Advanced workouts (locked)
- ❌ Diet Planner (locked)
- ❌ AI Weekly Insights (locked)
- ❌ Trend Graphs (locked)

### Basic Plan
- ✅ All workout levels (Basic, Intermediate, Advanced)
- ✅ Diet Planner with basic fields:
  - Fitness Goal (Lose Fat, Build Muscle, Maintain)
  - Diet Type (Veg, Non-Veg, Vegan)
  - Foods You Like
  - Foods to Avoid
- ✅ Trend Graphs (Steps, Calories, Water, Workouts)
- ❌ Allergens customization (locked)
- ❌ Macros customization (locked)
- ❌ Budget filter (locked)
- ❌ Weekly Plan Generator (locked)
- ❌ Ask Trainer to Review (locked)
- ❌ AI Weekly Insights (locked)

### Premium Plan
- ✅ Everything unlocked
- ✅ Full Diet Planner with:
  - All basic fields
  - Allergens (dairy, gluten, nuts, soy, eggs, shellfish, wheat, lactose-free)
  - Macro customization (Protein, Carbs, Fats)
  - Budget filter
  - Weekly Plan Generator
- ✅ AI Weekly Insights with:
  - Steps change percentage
  - Calories burned change
  - Consistency score
  - Personalized coaching tips
- ✅ Ask Trainer to Review button
- ✅ All trend graphs

## Page Structure

### 1. Subscription Banner (Top)
Displays current subscription tier with:
- Icon representing the tier
- Tier name and description
- What's included in current plan
- Upgrade button (if not Premium)
- Glassmorphic design with gradient background

### 2. Workout Section
**Components:**
- Category chips (Gym, Yoga, Boxing, Zumba, Stretching, Warmups)
- Level filters (Basic, Intermediate, Advanced)
  - Free users: only "Basic" available
  - Basic/Premium users: all levels available
- Workout cards with:
  - Thumbnail image
  - Title
  - Level badge (color-coded)
  - Duration (minutes)
  - Calories burned
  - Hover animations

### 3. Diet Planner Section
**Free Plan:**
- Locked section with blur effect
- "Upgrade to Unlock" CTA

**Basic Plan:**
- Goal selector
- Diet type selector
- Foods you like (textarea)
- Foods to avoid (textarea)
- Save Preferences button

**Premium Plan:**
- All basic fields
- Allergens checkbox group (8 options)
- Macro targets (Protein, Carbs, Fats)
- Daily budget input
- Generate Weekly Plan button
- Ask Trainer to Review button
- Save Preferences button

### 4. AI Weekly Insights (Premium Only)
Displays:
- Steps change (+12%)
- Calories change (-180)
- Consistency score (Good)
- Personalized coaching tip

### 5. Trend Graphs Section
Shows graphs for:
- Steps
- Calories
- Water Intake
- Workouts

**Free Plan:** Locked with blur effect and upgrade CTA
**Basic/Premium Plan:** Fully accessible with interactive charts

### 6. Upgrade CTA Section
- Visible when features are locked
- Encouraging message
- "View Pricing Plans" button

## Database Schema Required

### Tables Needed

#### `workouts`
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- gym, yoga, boxing, zumba, stretching, warmups
  level VARCHAR(50) NOT NULL, -- basic, intermediate, advanced
  duration_minutes INT NOT NULL,
  calories_burned INT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `diet_preferences`
```sql
CREATE TABLE diet_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  goal VARCHAR(50), -- lose_fat, build_muscle, maintain
  diet_type VARCHAR(50), -- veg, non_veg, vegan
  likes TEXT[], -- array of food preferences
  dislikes TEXT[], -- array of foods to avoid
  allergies TEXT[], -- array of allergens
  target_calories INT,
  meals_per_day INT,
  budget INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);
```

#### `diet_plans`
```sql
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  plan_type VARCHAR(50),
  macros JSONB, -- {protein: 150, carbs: 200, fats: 80}
  budget INT,
  weekly_plan JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `diet_review_requests`
```sql
CREATE TABLE diet_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  trainer_id UUID REFERENCES auth.users(id),
  diet_plan_id UUID NOT NULL REFERENCES diet_plans(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, approved, rejected
  trainer_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Update `profiles` table
```sql
ALTER TABLE profiles ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
-- Values: 'free', 'basic', 'premium'
```

## Files Created

### Hooks
1. **`client/hooks/useWorkouts.ts`**
   - Fetches workouts from Supabase
   - Filters by level and category
   - Includes demo data fallback

2. **`client/hooks/useDietPreferences.ts`**
   - Manages user diet preferences
   - Create/update preferences
   - Handles Supabase integration

3. **`client/hooks/useDietReviewRequests.ts`**
   - Creates review requests
   - Fetches request history
   - Updates request status

### Components
1. **`client/components/SubscriptionBanner.tsx`**
   - Displays tier information
   - Shows plan benefits
   - Upgrade CTA button

2. **`client/components/WorkoutCard.tsx`**
   - Displays individual workout
   - Shows level badge
   - Duration and calories
   - Lock state for restricted workouts

### Pages
1. **`client/pages/TrainingHub.tsx`**
   - Main hub page
   - All sections and features
   - Subscription gating logic
   - Demo data support

### Updated Files
1. **`client/App.tsx`**
   - Added TrainingHub import
   - Added /training-hub route

2. **`client/contexts/AuthContext.tsx`**
   - Added subscription_plan field to UserProfile

## Styling Details

### Colors
- Primary (Neon Orange): `#FF7A00`
- Gradients: Orange to Red (`from-orange-500 to-red-500`)
- Glassmorphism: 20-30% opacity with backdrop blur

### Design Elements
- Rounded corners: 20-30px (`rounded-2xl`, `rounded-3xl`)
- Soft transparency effects
- Blurred backgrounds on locked features
- Subtle glow on premium elements
- Smooth animations and transitions

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns

## Usage

### Access the Page
```
Navigate to: /training-hub
```

### Update Subscription Plan
In `AuthContext`, when fetching user profile:
```typescript
const userProfile = {
  ...profile,
  subscription_plan: "basic" // or "free", "premium"
};
```

### Add New Workouts (via Supabase)
```sql
INSERT INTO workouts (title, category, level, duration_minutes, calories_burned, thumbnail_url, description)
VALUES ('Workout Name', 'gym', 'basic', 30, 150, 'https://...', 'Description');
```

## Demo Data

The page includes demo data for:
- 9 sample workouts across all categories and levels
- Demo diet preferences
- Mock AI insights
- Sample trend graphs

This allows testing without Supabase connection.

## Feature Implementation

### Subscription Gating Pattern
```typescript
const isDietPlannerLocked = plan === "free";

{isDietPlannerLocked ? (
  <LockedSection />
) : (
  <UnlockedSection />
)}
```

### Locking UI Effect
- Glassmorphic background: `bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg`
- Border: `border border-white/20`
- Rounded corners: `rounded-3xl`
- Lock icon overlay
- Upgrade CTA button

## Future Enhancements

1. **Real-time data**
   - Connect trend graphs to actual health data
   - Integrate with fitness wearables

2. **AI Integration**
   - Generate actual AI insights
   - Personalized recommendations

3. **Trainer Integration**
   - Trainer assignment
   - Real-time review feedback

4. **Offline Support**
   - Cache workouts locally
   - Sync when online

5. **Notifications**
   - Workout reminders
   - Diet plan updates
   - Trainer feedback

## Troubleshooting

### Subscription Plan Not Showing
- Check if `subscription_plan` field exists in `profiles` table
- Verify user profile is being fetched correctly
- Check AuthContext for proper field mapping

### Workouts Not Loading
- Verify workouts table exists
- Check Supabase connection
- Falls back to demo data if error occurs

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check dark mode context
- Verify gradient classes are available

## API Reference

### useWorkouts
```typescript
const { workouts, loading, error, fetchWorkouts, getWorkoutsByLevel, getWorkoutsByCategory } = useWorkouts();
```

### useDietPreferences
```typescript
const { preferences, loading, error, fetchPreferences, updatePreferences } = useDietPreferences();
```

### useDietReviewRequests
```typescript
const { loading, error, createReviewRequest, getReviewRequests, updateReviewRequest } = useDietReviewRequests();
```

## Notes

- All locked sections use glassmorphic design for visual consistency
- Demo data is used when Supabase queries fail
- Page is fully responsive and mobile-optimized
- Dark mode is fully supported
- Animations are smooth and performance-optimized

## Support

For issues or feature requests related to the Training Hub, please refer to the TRAINING_HUB_GUIDE.md or contact the development team.
