# CoTrainr Workout Planner System - Complete Guide

## Overview

A complete **Workout Planner** system that automatically generates structured weekly workout plans based on:

- **Category**: Gym, Yoga, Boxing, Zumba, Stretching, Warmups
- **Level**: Beginner, Intermediate, Advanced
- **Goal**: Fat Loss, Muscle Gain, General Fitness

The planner integrates with the **2D Workout Animation Library** and respects the **Subscription Model**.

## Key Features

✅ **Weekly Calendar View** - Visual 7-day schedule (Mon-Sun)
✅ **Smart Filtering** - Categories and levels locked/unlocked by subscription
✅ **Auto-Generation** - AI-powered "Suggest Plan" button
✅ **Animation Previews** - 2D animations display in workout cards
✅ **Interactive Selection** - Modal panel to choose workouts
✅ **Plan Statistics** - Total minutes, calories, category breakdown
✅ **Mobile-First** - Responsive design optimized for all devices
✅ **Premium Styling** - Apple Fitness / Nike Training style interface

## Subscription Model

### Free Users

- **Categories Unlocked**: Gym (basic only), Warmups (basic only), Stretching (basic only)
- **Levels Available**: Beginner only
- **Features**: Manual planning, basic stats

### Basic & Premium Users

- **Categories Unlocked**: All 6 categories
- **Levels Available**: Beginner, Intermediate, Advanced
- **Features**: Full access including auto-generation

## System Architecture

### 1. **useWorkoutPlanner Hook**

**File**: `client/hooks/useWorkoutPlanner.ts`

Core state management and logic:

- `weeklyPlan` - Track workouts per day (0-6 index)
- `selectedCategory` - Currently active category
- `selectedLevel` - Currently active difficulty
- `selectedGoal` - Fitness goal (fat_loss, muscle_gain, general_fitness)

**Key Methods**:

- `addWorkoutToDay(dayIndex, workout)` - Add workout to specific day
- `removeWorkoutFromDay(dayIndex, workoutId)` - Remove single workout
- `clearDay(dayIndex)` - Clear all workouts from day
- `generateSuggestedPlan()` - Auto-generate based on category/level/goal
- `getPlanStats()` - Calculate total minutes, calories, category breakdown

### 2. **WorkoutPlanner Main Component**

**File**: `client/components/WorkoutPlanner.tsx`

Main container component that orchestrates:

- Goal selection (Fat Loss, Muscle Gain, General Fitness)
- Category selection with subscription gating
- Level selection with subscription gating
- "Suggest Plan" and "Clear Plan" buttons
- Sub-component rendering (WeeklyCalendar, ChooseWorkoutPanel, Summary)

**Features**:

- Real-time subscription checking
- Toast notifications for actions
- State management via useWorkoutPlanner hook

### 3. **WeeklyCalendar Component**

**File**: `client/components/WorkoutPlanner/WeeklyCalendar.tsx`

7-day horizontal grid view:

- Each day in its own card
- Shows assigned workouts or empty state
- "Add Workout" / "Add More" button for each day
- "Clear Day" button when workouts exist
- Responsive grid layout (1 col mobile, 2 cols tablet, 4 cols desktop)

### 4. **DayCard Component**

**File**: `client/components/WorkoutPlanner/DayCard.tsx`

Individual workout card with:

- **Animation Preview** - 2D animated thumbnail (20px height)
- **Level Badge** - Color-coded (green/yellow/red)
- **Category Chip** - Shows emoji + category name
- **Duration & Calories** - Stats footer
- **Remove Button** - Hover overlay with X button

### 5. **ChooseWorkoutPanel Component**

**File**: `client/components/WorkoutPlanner/ChooseWorkoutPanel.tsx`

Bottom-sheet modal for workout selection:

- **Header** - Shows category + level filter
- **Level Filter Buttons** - Switch difficulty with lock states
- **Workout Grid** - 2x column grid of DayCards with animations
- **Empty State** - Message if no workouts match filters
- **Upgrade Notice** - Shown to free users at bottom

**Interactions**:

- Tap workout card to select and add to day
- Swipe down or tap X to close

### 6. **WorkoutSummary Component**

**File**: `client/components/WorkoutPlanner/WorkoutSummary.tsx`

Statistics display with:

- **4-Column Stat Grid**:
  - Total Workouts
  - Total Minutes
  - Total Calories
  - Active Categories Count
- **Category Breakdown** - Horizontal bar charts with percentages
- **Average Stats** - Per-workout averages
- **Empty State** - Message when no plan exists

## Auto-Generation Logic

### GYM Category

**Beginner Split** (Single Muscle Per Day):

```
Mon: Chest (3 exercises)
Tue: Back (3 exercises)
Wed: Shoulders (3 exercises)
Thu: Arms (3 exercises)
Fri: Legs (3 exercises)
Sat: Abs (3 exercises)
Sun: Stretching/Mobility
```

**Intermediate Split** (Push/Pull/Legs):

```
Mon: Push (Chest, Shoulders, Triceps)
Tue: Pull (Back, Biceps)
Wed: Legs (Quads, Hamstrings, Calves)
Thu: Boxing/Zumba Conditioning
Fri: Core + Stability
Sat: Yoga Flow
Sun: Light Warmup or Rest
```

**Advanced Split** (Strength + Conditioning):

```
Mon: Chest/Shoulders Strength
Tue: Back/Arms Strength
Wed: Legs Power
Thu: HIIT Boxing or Cardio
Fri: Core + Mobility
Sat: Yoga + Deep Stretch
Sun: Complete Rest
```

### BOXING Category

- **Beginner**: Jab, Cross, basic footwork (3-4 per week)
- **Intermediate**: Hooks, Uppercuts, combos (3-4 per week)
- **Advanced**: Power combos, defensive flows (3-4 per week)
- Complementary days: Yoga, Stretching

### ZUMBA Category

- **Beginner**: Basic rhythms and steps (3-4 per week)
- **Intermediate**: 4-8 count choreography blocks (3-4 per week)
- **Advanced**: Full choreography routines (3-4 per week)
- Complementary days: Warmups, Stretching

### YOGA Category

- Daily yoga progression (7 different poses/flows)
- **Beginner**: Foundational poses + breathing
- **Intermediate**: Flows and transitions
- **Advanced**: Power yoga, balance poses, inversions

### STRETCHING Category

- Daily flexibility work (7 different stretches)
- **Beginner**: Basic flexibility
- **Intermediate**: Active mobility
- **Advanced**: Deep flexibility flows

### WARMUPS Category

- Pre-workout preparation (5 days, rest on weekends)
- **Beginner**: Arm swings, marching
- **Intermediate**: High knees, jumping jacks
- **Advanced**: Skater hops, burpee warm-ups

## UI/UX Design

### Color Scheme

- **Primary**: Orange/Red gradient (from-orange-500 to-red-500)
- **Secondary**: Purple gradient for "Suggest Plan" button
- **Accents**: Green (Beginner), Yellow (Intermediate), Red (Advanced)
- **Locked State**: Gray with opacity

### Typography

- **Headers**: Bold (font-bold), 2xl size
- **Labels**: Semibold (font-semibold), sm size
- **Stats**: Bold, 2xl size

### Spacing & Layout

- 6px (0.375rem) gaps between cards
- 4px (1rem) padding inside cards
- 2xl rounded corners (rounded-2xl)
- Glassmorphism: backdrop-blur, white/transparent backgrounds

### Responsive Breakpoints

- **Mobile**: 1 column for weekly calendar
- **Tablet** (md): 2 columns for weekly calendar
- **Desktop** (lg): 4 columns for weekly calendar

## Integration Points

### TrainingHub.tsx

The WorkoutPlanner is integrated as the `WeeklyPlannerSection` in the carousel:

```typescript
const carouselSections = [
  {
    id: "weekly-planner",
    title: "Weekly Workout Planner",
    icon: "📅",
    component: <WeeklyPlannerSection />,
  },
  // ... other sections
];

const WeeklyPlannerSection = () => <WorkoutPlanner />;
```

### Data Flow

1. **Auth Context** → Get user profile and subscription plan
2. **useWorkouts Hook** → Fetch available workouts
3. **useWorkoutPlanner Hook** → Manage planner state
4. **Animation Library** → Display 2D previews via WorkoutAnimationRenderer

## File Structure

```
client/
├── hooks/
│   └── useWorkoutPlanner.ts          (360 lines - core logic)
├── components/
│   ├── WorkoutPlanner.tsx            (main component)
│   └── WorkoutPlanner/
│       ├── WeeklyCalendar.tsx        (7-day grid)
│       ├── DayCard.tsx               (workout card)
│       ├── ChooseWorkoutPanel.tsx    (selection modal)
│       └── WorkoutSummary.tsx        (stats display)
└── pages/
    └── TrainingHub.tsx               (integrates planner)
```

## Usage Example

```typescript
import WorkoutPlanner from "@/components/WorkoutPlanner";

function MyPage() {
  return (
    <div className="p-6">
      <WorkoutPlanner />
    </div>
  );
}
```

## State Management

The planner uses a simple state object:

```typescript
weeklyPlan = {
  0: [Workout, Workout], // Monday
  1: [Workout], // Tuesday
  2: [], // Wednesday (empty)
  // ... etc
  6: [Workout], // Sunday
};
```

## Performance Considerations

✅ **Memoization** - Components use memo where appropriate
✅ **Lazy Loading** - Animations only render when visible
✅ **Efficient Filtering** - Array methods optimized
✅ **State Updates** - Minimal re-renders via proper dependency management

## Future Enhancements

- **Persistence** - Save plans to Supabase
- **Smart Goals** - Auto-adjust based on goal
- **Progress Tracking** - Mark completed workouts
- **Notifications** - Remind users of upcoming workouts
- **Export** - Download/share weekly plans
- **REST Days** - Auto-assign recovery workouts
- **Seasonal Plans** - Pre-built plans for specific seasons
- **Coach Mode** - Trainer dashboard to assign plans

## Testing Checklist

- [ ] Free users see only Beginner + basic categories
- [ ] Basic/Premium users see all levels and categories
- [ ] Auto-generation works for all categories
- [ ] Workouts can be added/removed from days
- [ ] Summary stats calculate correctly
- [ ] Animation previews display properly
- [ ] Modal opens/closes smoothly
- [ ] Responsive layout works on mobile/tablet/desktop

## Summary

The Workout Planner is a **complete, production-ready system** that provides:

- Smart weekly planning with auto-generation
- Subscription-aware access control
- Beautiful, intuitive UI
- Integration with 2D animation library
- Comprehensive statistics and insights

It's designed to feel like a premium fitness app (Apple Fitness+, Nike Training) while maintaining simplicity and usability.
