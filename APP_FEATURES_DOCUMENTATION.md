# CoTrainr - Complete Application Features & Architecture Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Client Application Features](#client-application-features)
4. [User Roles & Dashboards](#user-roles--dashboards)
5. [Subscription & Payment Integration](#subscription--payment-integration)
6. [Workflows & User Journeys](#workflows--user-journeys)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Technical Stack](#technical-stack)
10. [Security & Authentication](#security--authentication)

---

## Executive Summary

**CoTrainr** is a comprehensive fitness and wellness platform connecting clients with personal trainers and nutritionists. The application provides role-based dashboards for:
- **Clients**: Track fitness goals, nutrition, workouts, connect with trainers
- **Trainers**: Manage clients, track progress, schedule sessions, provide coaching
- **Admins**: Oversee platform operations, verify trainers, manage users, view analytics

### Key Differentiators
- **Subscription-based premium features** via Razorpay
- **Real-time progress tracking** with health sync integration
- **Video consultation capabilities** for trainer-client interactions
- **AI-powered insights** for personalized coaching recommendations
- **Gamification elements** (achievements, leaderboards, streaks)
- **Multi-language support** (English, Bengali, Gujarati, Hindi, etc.)

---

## System Architecture

### Technology Stack Overview

```
Frontend: React 18 + React Router 6 (SPA)
Backend: Express.js with Node.js
Database: PostgreSQL (via Supabase)
Authentication: Supabase Auth
Payment Gateway: Razorpay
Styling: TailwindCSS 3 + Radix UI
Build Tools: Vite
Deployment: Netlify (Serverless Functions)
Mobile: Capacitor (React-to-Native bridge)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│         Frontend (React SPA)                        │
│  • Routes: / (home), /trainer/:id, /subscription  │
│  • Components: Auth, Dashboard, Modals, Cards      │
│  • State Management: React Context + React Query   │
└────────────┬────────────────────────────────────────┘
             │ (HTTPS/REST)
┌────────────▼────────────────────────────────────────┐
│    Express.js Backend (API Gateway)                │
│  • Routes: /api/auth, /api/users, /api/trainers   │
│  • Middleware: CORS, Auth validation               │
│  • Serverless: Netlify Functions wrapper           │
└────────────┬────────────────────────────────────────┘
             │ (Database Queries)
┌────────────▼────────────────────────────────────────┐
│    Supabase (PostgreSQL + Auth)                    │
│  • Tables: users, trainers, subscriptions, posts   │
│  • Auth: Email/Password + Session Management       │
│  • Realtime: Subscriptions for live updates        │
└─────────────────────────────────────────────────────┘
```

---

## Client Application Features

### 1. Authentication & Onboarding
- **Sign Up**: Email-based registration with email verification
- **Sign In**: Secure authentication via Supabase Auth
- **Onboarding**: Multi-step profile setup (fitness goal, preferences)
- **Social Profiles**: Optional social media integration
- **Demo Mode**: Test app without full registration

### 2. Client Dashboard (Home Page)
**Primary Features:**
- **Daily Health Tracking**: Steps, water intake, calories, workout metrics
- **Progress Visualization**: Progress bars, charts, trend analysis
- **Target Setting**: Customizable daily targets (steps, water, etc.)
- **Mood Tracking**: Weekly mood entries with visual feedback
- **Health Sync**: Integration with device health data (iOS/Android)
- **Cover Image**: Custom cover photo for profile
- **Motivational Quotes**: Daily inspiration messages
- **Pending Meetings**: Quick view of upcoming sessions
- **Latest Feed**: Social feed showing trainer/nutritionist posts

### 3. Fitness & Workout Features
**Workout Planner Module:**
- Browse exercise library (Gym, Zumba, Boxing, CrossFit, Yoga, Dance, Flexibility)
- Weekly workout calendar with visual progress
- Exercise selection and tracking
- Subscription-based access to advanced workouts
- Video demonstrations (via trainer sessions)

**Activity Tracking:**
- Log daily activities (Gym, Running, Cycling, Sports, etc.)
- Track calories burned
- View activity statistics
- Achievement badges for consistency

### 4. Nutrition Management
**Meal Tracking:**
- Log meals (breakfast, lunch, dinner, snacks)
- Track macronutrients (protein, carbs, fats, calories)
- View daily nutrition summary
- Historical meal logs

**Diet Plans:**
- Browse available diet plans
- AI-powered meal suggestions
- Personalized nutrition insights
- Weekly nutrition reports

**Meal Planning:**
- AI Diet Plan Creator for custom meal plans
- Meal scheduling
- Grocery list generation

### 5. Trainer Discovery & Booking
**Discover Trainers:**
- Search trainers by specialty (Gym, Zumba, Boxing, CrossFit, Yoga)
- View trainer profiles with credentials
- Read trainer bio and specialties
- Check trainer ratings and reviews

**Booking & Payments:**
- Schedule sessions with trainers
- Pay per session via Razorpay
- Book multiple sessions in advance
- Session confirmation and reminders

**Video Consultations:**
- One-on-one video calls with trainers
- Screen sharing capabilities
- Session recording (optional)
- Post-session notes and feedback

### 6. Social & Community Features
**Social Feed:**
- View posts from trainers and community
- Like and comment on posts
- Share achievements and progress
- Fitness tips and motivational content

**User Profiles:**
- View public user profiles
- Follow/Unfollow users
- Follower/Following lists
- Social statistics

**Leaderboard:**
- Global fitness rankings
- Category-based rankings (steps, calories burned, streaks)
- Weekly and monthly challenges
- Achievement tiers

### 7. Premium Subscription System
**Subscription Plans:**
- **Basic Monthly**: ₹299/month
- **Basic Yearly**: ₹2,999/year (Save 17%)
- **Premium Monthly**: ₹599/month
- **Premium Yearly**: ₹5,999/year (Save 17%)

**Premium Benefits:**
- Advanced analytics & insights
- Unlimited trainer access
- Achievement tracking
- Streak history & milestones
- Personalized training plans
- One-on-one coaching priority
- Priority support

### 8. Notifications & Messaging
**In-App Notifications:**
- Session reminders
- Trainer messages and updates
- Achievement unlocked alerts
- System announcements

**Direct Messaging:**
- Chat with trainers
- Message history
- Typing indicators
- Read receipts

### 9. Achievements & Gamification
**Achievement System:**
- Step milestones (1K, 5K, 10K, 50K steps)
- Workout consistency badges
- Nutrition tracking achievements
- Social engagement rewards

**Streaks:**
- Daily streak tracking
- Weekly workout streaks
- Nutrition logging streaks
- Milestone celebrations

### 10. Analytics & Insights
**Weekly AI Insights:**
- Personalized fitness recommendations
- Nutrition analysis
- Progress summaries
- Goal adjustment suggestions
- Premium insight enhancements

**Personal Analytics:**
- Activity trends
- Calorie trends
- Workout frequency analysis
- Sleep and recovery data

### 11. Account Management
**Profile Settings:**
- Edit personal information
- Update fitness goals
- Change preferences
- Privacy settings

**Account Preferences:**
- Notification settings
- Language selection (Multi-language support)
- Theme preference (Dark/Light mode)
- Data export

---

## User Roles & Dashboards

### 1. CLIENT DASHBOARD

#### Routes:
- `/` - Home (Daily tracking, targets, motivation)
- `/discover` - Find trainers and services
- `/trainer/:id` - View trainer profile and book sessions
- `/messages` - Direct messaging with trainers
- `/meals` - Meal logging and nutrition tracking
- `/diet-plans` - Browse and select diet plans
- `/diet-plan/:id` - View diet plan details
- `/achievements` - View unlocked achievements and stats
- `/leaderboard` - Global rankings
- `/feed` - Social feed and community posts
- `/profile` - Edit personal profile
- `/profile/:userId` - View other user profiles
- `/video-sessions` - View past and upcoming video calls
- `/subscription` - View and manage subscription
- `/followers-following` - Manage followers/following

#### Key Features:
- Real-time progress tracking
- Health data sync
- Trainer booking and payments
- Nutrition and meal management
- Social engagement
- Subscription management

---

### 2. TRAINER DASHBOARD

#### Routes:
- `/trainer-home` - Trainer home screen (redirects from `/` if role=trainer)
- `/trainer-signup` - Become a trainer registration
- `/trainer-dashboard` - Client management hub
- `/trainer/client/:clientId` - Individual client detail and analytics
- `/trainer/:id/payment` - Payment processing for bookings

#### Dashboard Features:

**Client Management:**
- Total clients overview
- Active clients count
- Average client progress
- Video sessions completed counter
- Client list with expandable details

**Client Details View:**
- Client profile and goals
- Progress percentage tracking
- Weight progress visualization
- Sessions completed (X/total)
- Meal logs this week (X/21)
- Video sessions count
- Weekly average metrics:
  - Calories per day
  - Protein intake per day
  - Workout frequency per week
  - Average session duration
- Trainer notes and observations
- Action buttons: View Details, Message

**Quick Actions:**
- Add new client
- Schedule sessions
- Set client goals
- View achievements
- Send messages

**Statistics:**
- Total clients managed
- Active client percentage
- Overall client progress average
- Total video sessions completed
- Number of clients near goals

#### Trainer Features:
- Client progress tracking with visual indicators
- Personalized coaching notes
- Session scheduling and management
- Video consultation capabilities
- Client messaging system
- Performance analytics

---

### 3. ADMIN DASHBOARD

#### Routes:
- `/admin` - Trainer verification hub (default)
- `/admin/analytics` - Platform analytics and insights
- `/admin/users` - User management system
- `/admin/users/:userId` - Individual user details
- `/admin/trainers` - Trainer management
- `/admin/communication` - System-wide messaging
- `/admin/system` - System health and status
- `/admin/stats` - Quick statistics overview
- `/admin/settings` - Platform configuration

#### Admin Features:

**1. Trainer Verification System**
- List of pending trainer registrations
- Verification tabs:
  - Pending (Awaiting review)
  - Approved (Verified trainers)
  - Rejected (Failed verification)
  - Re-review (Resubmitted applications)

- Verification Card Details:
  - Trainer profile information
  - Uploaded documents (ID, certificates, photo)
  - Specialties listed
  - Verification status with timestamps
  - Approval/Rejection actions
  - Re-verification request handling

- Actions Available:
  - Approve trainer with notes
  - Reject trainer with reason
  - Request re-submission
  - Revoke verification
  - Send messages to trainer

**2. Analytics Dashboard**
- **Key Metrics:**
  - Total Users (registered clients)
  - Total Trainers (verified and active)
  - Total Subscriptions (active plans)
  - Platform Revenue (from subscriptions)
  - User Growth (daily/monthly)
  - Trainer Approval Rate (%)
  - Rejection Rate (%)

- **Charts & Visualization:**
  - User acquisition trends
  - Trainer verification statistics
  - Revenue by subscription tier
  - User engagement metrics
  - Trainer performance metrics

**3. User Management**
- User list with filters
- Search and sort capabilities
- User profile details:
  - Account information
  - Registration date
  - Activity status
  - Subscription details
  - Role (client/trainer/admin)
  - Account balance/credits

- Actions:
  - View user profile
  - Suspend/Unsuspend account
  - Refund transactions
  - View activity history
  - Send messages
  - Export user data

**4. Trainer Management**
- Complete trainer directory
- Trainer status filters:
  - Active
  - Inactive
  - Suspended
  - Banned

- Trainer Information:
  - Profile details
  - Specialties and certifications
  - Client count
  - Ratings and reviews
  - Revenue generated
  - Verification status

- Admin Actions:
  - Edit trainer information
  - Manage verification status
  - Set commission rates
  - View client list
  - Monitor performance

**5. Communication Center**
- Send platform-wide announcements
- Email notifications to users/trainers
- Bulk messaging system
- Message templates
- Delivery tracking
- Message history

**6. System Health Monitoring**
- Database health status
- API uptime statistics
- Error tracking and logs
- Performance metrics
- Security alerts
- Backup status

**7. Quick Stats Dashboard**
- Snapshot of key metrics
- Real-time counters
- Trending information
- Quick action buttons
- System status indicators

**8. Platform Settings**
- Commission structure
- Subscription plan management
- Tax configuration
- API keys and integrations
- Email configuration
- Feature toggles
- Maintenance mode

---

## Subscription & Payment Integration

### Payment System Architecture

```
┌─────────────────────────────────────────┐
│      Client Clicks Subscribe            │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Subscription Modal/Page Loads          │
│   - Display available plans              │
│   - Show pricing in INR                  │
│   - Display premium benefits             │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   User Selects Plan                      │
│   - Monthly or Yearly option             │
│   - Select payment method                │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Razorpay Payment Processing            │
│   - Create order on backend              │
│   - Initialize Razorpay checkout        │
│   - Handle payment response              │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Payment Verification                   │
│   - Verify payment ID                    │
│   - Confirm amount                       │
│   - Create subscription record           │
└────────────┬────────────────────────────┘
             ���
┌────────────▼────────────────────────────┐
│   Subscription Activated                 │
│   - Update user subscription status      │
│   - Grant premium feature access         │
│   - Send confirmation email              │
└─────────────────────────────────────────┘
```

### Subscription Plans

#### Basic Plan
**Monthly (₹299/month) | Yearly (₹2,999/year)**
- Advanced analytics & insights
- Workout recommendations
- Progress tracking
- Achievement system

#### Premium Plan
**Monthly (₹599/month) | Yearly (₹5,999/year)**
- All Basic features plus:
- Unlimited trainer access
- Priority support
- Exclusive training content
- Advanced AI coaching recommendations
- Priority booking with trainers
- Extended video session limits

### Payment Processing

**Razorpay Integration:**
- Secure payment gateway for Indian market
- Multiple payment methods:
  - Credit/Debit cards
  - UPI
  - Net Banking
  - Wallets
  
**Payment Workflow:**
1. User initiates subscription from `/subscription` page
2. Backend creates Razorpay order
3. Frontend loads Razorpay checkout modal
4. User completes payment
5. Razorpay returns payment ID to callback handler
6. Backend verifies payment with Razorpay
7. Subscription record created in database
8. User gains premium access immediately
9. Confirmation email sent

**Subscription Management:**
- Auto-renewal on subscription period end
- Cancel anytime from account settings
- Refund processing (pro-rata or full)
- Subscription history and invoices

### Database: Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID (Foreign Key: users),
  plan_id VARCHAR (e.g., 'co_basic_monthly'),
  provider VARCHAR ('razorpay' or 'stripe'),
  status VARCHAR ('active', 'cancelled', 'expired'),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  provider_subscription_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Workflows & User Journeys

### Client User Journey

#### 1. Onboarding Workflow
```
Sign Up
  ↓
Email Verification
  ↓
Create Profile
  ↓
Set Fitness Goals
  ↓
Choose Preferences (Language, Theme)
  ↓
Grant Permissions (Health sync, Notifications)
  ↓
Home Dashboard
```

#### 2. Fitness Tracking Daily Workflow
```
Log in to Home
  ↓
Update Today's Targets (Steps, Water, etc.)
  ↓
View Progress (Today's stats vs targets)
  ↓
Log Meals (Breakfast, Lunch, Dinner)
  ↓
Track Workouts
  ↓
Check Achievements (Unlocked badges)
  ↓
View Insights (AI-powered recommendations)
```

#### 3. Trainer Booking Workflow
```
Browse Trainers (/discover)
  ↓
View Trainer Profile (/trainer/:id)
  ↓
Check Availability & Ratings
  ↓
Select Time Slot & Click "Book Session"
  ↓
Payment Processing (/trainer/:trainerId/payment)
  ↓
Razorpay Checkout
  ↓
Payment Confirmation
  ↓
Session Added to Calendar
  ↓
Video Call at Scheduled Time
  ↓
Post-Session Feedback
```

#### 4. Subscription Upgrade Workflow
```
Click "Upgrade" or "Subscribe"
  ↓
Navigate to /subscription
  ↓
Review Plans & Benefits
  ↓
Select Plan (Monthly/Yearly)
  ↓
Click "Subscribe with Razorpay"
  ↓
Razorpay Payment Modal Opens
  ↓
Select Payment Method
  ↓
Complete Payment
  ↓
Subscription Activated
  ↓
Premium Features Unlocked
  ↓
Notification Sent
```

### Trainer User Journey

#### 1. Trainer Signup Workflow
```
Navigate to /trainer-signup
  ↓
Enter Personal Information
  ↓
Select Specialties (Gym, Zumba, Boxing, etc.)
  ↓
Upload ID & Certification Documents
  ↓
Upload Profile Photo
  ↓
Await Admin Verification
  ↓
[Admin Reviews & Approves]
  ↓
Trainer Account Activated
```

#### 2. Trainer Client Management Workflow
```
Log in as Trainer
  ↓
Navigate to /trainer-dashboard
  ↓
View Client List with Progress
  ↓
Click Client to View Details (/trainer/client/:clientId)
  ↓
Review Client Stats:
    - Progress percentage
    - Weight changes
    - Meal logs
    - Workout frequency
    - Average session duration
  ↓
Add/Update Notes
  ↓
Schedule Video Session
  ↓
Conduct Session (Video Call)
  ↓
Provide Feedback
  ↓
Update Client Goals
```

#### 3. Client Coaching Workflow
```
New Client Requests Training
  ↓
Trainer Reviews Request
  ↓
Schedule Initial Assessment
  ↓
Video Call with Client
  ↓
Create Personalized Plan
  ↓
Set Milestone Goals
  ↓
Assign Workouts & Meal Plans
  ↓
Weekly Check-ins via Video
  ↓
Monitor Progress & Adjust Plan
  ↓
Celebrate Milestones
```

### Admin User Journey

#### 1. Trainer Verification Workflow
```
Navigate to /admin
  ↓
Review Pending Trainer Applications
  ↓
View Trainer Details:
    - Profile Info
    - Uploaded Documents
    - Credentials
    - Specialties
  ↓
Decision Point:
    ├─→ Approve Trainer
    │    ↓
    │    Add Notes
    │    ↓
    │    Trainer Gets Access
    │
    ├─→ Reject Trainer
    │    ↓
    │    Provide Rejection Reason
    │    ↓
    │    Send Feedback
    │
    └─→ Request Re-review
         ↓
         Send Message to Trainer
         ↓
         Await Resubmission
  ↓
Update Trainer Status
  ↓
Send Notification
```

#### 2. Platform Monitoring Workflow
```
Navigate to /admin/analytics
  ↓
Review Key Metrics:
    - Total Users
    - Total Trainers
    - Subscriptions Active
    - Revenue
  ↓
Analyze Trends:
    - User Growth
    - Trainer Performance
    - Approval Rates
  ↓
Navigate to /admin/system
  ↓
Check System Health:
    - Database Status
    - API Uptime
    - Error Logs
  ↓
Take Corrective Actions if Needed
```

#### 3. User Management Workflow
```
Navigate to /admin/users
  ↓
View User List
  ↓
Search/Filter Users
  ↓
Click User to View Details (/admin/users/:userId)
  ↓
Review User Information:
    - Account Status
    - Activity History
    - Subscription
    - Transactions
  ↓
Actions Available:
    - Suspend Account
    - Process Refund
    - Send Message
    - View Activity
  ↓
Update User Status
```

---

## Database Schema

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  date_of_birth DATE,
  gender ENUM ('male', 'female', 'other'),
  profile_picture_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  role ENUM ('client', 'trainer', 'nutritionist'),
  subscription_plan ENUM ('free', 'basic', 'premium'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 2. Trainer Profiles Table
```sql
CREATE TABLE trainer_profiles (
  id UUID PRIMARY KEY,
  user_id UUID (Foreign Key: users),
  specialties VARCHAR[],
  certifications TEXT[],
  experience_years INT,
  bio TEXT,
  average_rating DECIMAL,
  total_clients INT,
  hourly_rate DECIMAL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 3. Trainer Verifications Table
```sql
CREATE TABLE trainer_verifications (
  id UUID PRIMARY KEY,
  trainer_id UUID (Foreign Key: users),
  verification_status ENUM ('pending', 'approved', 'rejected', 're_review'),
  submitted_documents JSONB,
  id_document_url TEXT,
  certification_url TEXT,
  profile_photo_url TEXT,
  rejection_reason TEXT,
  verified_by UUID (Foreign Key: users),
  verified_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 4. Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID (Foreign Key: users),
  plan_id VARCHAR,
  provider VARCHAR ('razorpay', 'stripe'),
  status ENUM ('active', 'cancelled', 'expired'),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  provider_subscription_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 5. Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID (Foreign Key: users),
  amount DECIMAL,
  currency VARCHAR,
  description TEXT,
  razorpay_order_id VARCHAR,
  razorpay_payment_id VARCHAR,
  status VARCHAR ('pending', 'completed', 'failed', 'refunded'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 6. Trainer Client Relationships Table
```sql
CREATE TABLE trainer_clients (
  id UUID PRIMARY KEY,
  trainer_id UUID (Foreign Key: users),
  client_id UUID (Foreign Key: users),
  progress_percentage INT,
  goal_type VARCHAR,
  current_stats JSONB,
  notes TEXT,
  status ENUM ('active', 'paused', 'completed'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 7. Video Sessions Table
```sql
CREATE TABLE video_sessions (
  id UUID PRIMARY KEY,
  trainer_id UUID (Foreign Key: users),
  client_id UUID (Foreign Key: users),
  scheduled_at TIMESTAMP,
  duration_minutes INT,
  status ENUM ('scheduled', 'in_progress', 'completed', 'cancelled'),
  video_url TEXT,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 8. Meal Entries Table
```sql
CREATE TABLE meal_entries (
  id UUID PRIMARY KEY,
  user_id UUID (Foreign Key: users),
  meal_type ENUM ('breakfast', 'lunch', 'dinner', 'snack'),
  food_items TEXT[],
  calories INT,
  protein_g DECIMAL,
  carbs_g DECIMAL,
  fats_g DECIMAL,
  logged_at TIMESTAMP,
  created_at TIMESTAMP
);
```

#### 9. Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID (Foreign Key: users),
  content TEXT,
  image_url TEXT,
  likes_count INT,
  comments_count INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 10. Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID (Foreign Key: users),
  recipient_id UUID (Foreign Key: users),
  content TEXT,
  read BOOLEAN,
  created_at TIMESTAMP
);
```

---

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/signup
- Create new user account
- Body: { email, password, full_name }
- Response: { user, session }

POST /api/auth/signin
- User login
- Body: { email, password }
- Response: { user, session }

POST /api/auth/signout
- User logout
- Response: { success: true }

POST /api/auth/refresh
- Refresh authentication token
- Response: { session }
```

### User Endpoints

```
GET /api/users/:userId
- Fetch user profile
- Response: { UserProfile }

PUT /api/users/:userId
- Update user profile
- Body: { full_name, bio, profile_picture_url, ... }
- Response: { updated UserProfile }

GET /api/users/:userId/stats
- Fetch user statistics
- Response: { activity_count, followers, following, ... }
```

### Trainer Endpoints

```
GET /api/trainers
- List all verified trainers
- Query: { specialty, rating, page }
- Response: { trainers: TrainerProfile[] }

GET /api/trainers/:trainerId
- Fetch trainer details
- Response: { TrainerProfile }

POST /api/trainers
- Create trainer profile (signup)
- Body: { specialties, certifications, bio, rate }
- Response: { TrainerProfile }

POST /api/trainers/:trainerId/verify
- Admin: Verify trainer
- Body: { status, notes }
- Response: { success: true }
```

### Subscription Endpoints

```
GET /api/subscriptions/current
- Fetch current user subscription
- Response: { Subscription }

POST /api/subscriptions
- Create new subscription
- Body: { plan_id, provider }
- Response: { Subscription }

POST /api/subscriptions/:subscriptionId/cancel
- Cancel subscription
- Response: { success: true }

GET /api/subscriptions/plans
- List all available plans
- Response: { plans: SubscriptionPlan[] }
```

### Payment Endpoints

```
POST /api/payments/create-order
- Create Razorpay order
- Body: { amount, plan_id }
- Response: { order_id, amount }

POST /api/payments/verify
- Verify Razorpay payment
- Body: { razorpay_payment_id, razorpay_order_id }
- Response: { success: true, payment }

GET /api/payments/history
- Fetch user payment history
- Response: { payments: Payment[] }
```

### Booking Endpoints

```
POST /api/bookings
- Create session booking
- Body: { trainer_id, scheduled_at, duration_minutes }
- Response: { Booking }

GET /api/bookings/:userId
- Fetch user bookings
- Response: { bookings: Booking[] }

PUT /api/bookings/:bookingId
- Update booking details
- Body: { status, notes }
- Response: { updated Booking }
```

### Messaging Endpoints

```
GET /api/messages/:conversationId
- Fetch conversation messages
- Response: { messages: Message[] }

POST /api/messages
- Send message
- Body: { recipient_id, content }
- Response: { Message }

PUT /api/messages/:messageId/read
- Mark message as read
- Response: { success: true }
```

### Admin Endpoints

```
GET /api/admin/trainers/pending
- Fetch pending trainer verifications
- Response: { trainers: TrainerVerification[] }

POST /api/admin/trainers/:trainerId/approve
- Approve trainer
- Body: { notes }
- Response: { success: true }

POST /api/admin/trainers/:trainerId/reject
- Reject trainer
- Body: { reason }
- Response: { success: true }

GET /api/admin/analytics
- Fetch platform analytics
- Response: { stats: AdminStats }

GET /api/admin/users
- Fetch all users (paginated)
- Query: { page, limit, role }
- Response: { users: UserProfile[], total }

PUT /api/admin/users/:userId/status
- Update user account status
- Body: { status }
- Response: { success: true }
```

---

## Technical Stack

### Frontend Stack
- **Framework**: React 18.3.1
- **Routing**: React Router 6
- **Styling**: TailwindCSS 3.4.17
- **UI Components**: Radix UI, Lucide Icons
- **Form Handling**: React Hook Form
- **Data Fetching**: React Query (TanStack Query)
- **State Management**: React Context API
- **Build Tool**: Vite 7.1.2
- **Language**: TypeScript 5.9.2
- **Testing**: Vitest

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Deployment**: Netlify Serverless Functions
- **Utilities**: serverless-http, CORS, dotenv

### Database & Backend Services
- **Primary DB**: PostgreSQL (Supabase)
- **Auth Provider**: Supabase Auth
- **Real-time**: Supabase Realtime Subscriptions
- **File Storage**: Supabase Storage (for documents/images)
- **Serverless**: Netlify Functions

### Payment & Third-party Integration
- **Payment Gateway**: Razorpay (for Indian market)
- **Video Calling**: WebRTC (via Peer-to-peer or SFU)
- **Health Sync**: Capacitor integration with device health APIs
- **Mobile**: Capacitor 5.0.8 (React-to-Native bridge)
- **Analytics**: Optional integration ready

### Development Tools
- **Package Manager**: pnpm 10.14.0
- **Version Control**: Git
- **Build Automation**: Vite + npm scripts
- **Code Formatting**: Prettier
- **Type Checking**: TypeScript compiler

---

## Security & Authentication

### Authentication Flow

```
User Login
  ↓
Email & Password Validation
  ↓
Supabase Auth Processing
  ↓
JWT Token Generation
  ↓
Session Creation
  ↓
Token Stored in Browser (Secure)
  ↓
User Authenticated
```

### Key Security Features

1. **Supabase Auth**
   - Email verification
   - Password hashing (bcrypt)
   - Session management
   - JWT token handling
   - Token refresh mechanism

2. **CORS Protection**
   - Only trusted origins allowed
   - Credentials sent securely
   - HTTPS enforced in production

3. **Environment Variables**
   - Sensitive keys stored securely
   - Never committed to repository
   - Separate .env.local for development
   - Netlify environment variables for production

4. **Role-Based Access Control (RBAC)**
   - Client role: Limited to own data
   - Trainer role: Access to client data
   - Admin role: Full platform access
   - Protected routes with role validation

5. **Payment Security**
   - Razorpay handles PCI DSS compliance
   - No card data stored on servers
   - Payment IDs verified server-side
   - Encryption for sensitive data

6. **Database Security**
   - Row Level Security (RLS) policies
   - Foreign key constraints
   - Parameterized queries (protection from SQL injection)
   - Regular backups by Supabase

### Protected Routes

Routes require authentication:
- `/` (Home) - ProtectedRoute
- `/discover` - ProtectedRoute
- `/subscription` - ProtectedRoute
- `/trainer-dashboard` - ProtectedRoute + TrainerRole
- `/admin/*` - ProtectedRoute + AdminRole

Public routes:
- `/login` - Login page
- `/onboarding` - Signup and initial setup

---

## Deployment & DevOps

### Development
```bash
pnpm dev
# Runs Vite dev server with Express integration
# Frontend: http://localhost:5173
# Backend: http://localhost:8080 (via Vite proxy)
```

### Production Build
```bash
pnpm build
# Creates optimized frontend bundle + backend build
# Output: dist/spa/ (frontend), dist/server/ (backend)
```

### Deployment Platform
- **Primary**: Netlify
- **Serverless Functions**: Netlify Functions
- **Express Adapter**: serverless-http

### Environment Setup
**.env.local (Development)**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Netlify Env Variables (Production)**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Deployment Checklist
- [ ] Build passes locally
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Razorpay keys configured
- [ ] CORS allowed origins updated
- [ ] SSL/HTTPS enabled
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place
- [ ] CI/CD pipeline set up

---

## Feature Roadmap & Future Enhancements

### Planned Features
1. **AI Coaching Assistant**
   - Real-time form correction using computer vision
   - Personalized workout recommendations
   - Nutrition optimization algorithms

2. **Advanced Social Features**
   - Friend requests and profiles
   - Group challenges
   - Social live streaming

3. **Wearable Integration**
   - Apple Watch sync
   - Fitbit integration
   - Garmin integration

4. **Advanced Analytics**
   - Predictive analytics for goal achievement
   - Comparative analysis with peers
   - Trend forecasting

5. **Mobile App**
   - Native iOS and Android apps
   - Offline functionality
   - Push notifications

6. **Marketplace**
   - Nutrition product recommendations
   - Equipment marketplace
   - Trainer certification courses

---

## Support & Documentation

### For Developers
- **API Documentation**: Available in `/docs/api`
- **Setup Guide**: See `SETUP_INSTRUCTIONS.md`
- **Architecture Notes**: See `AGENTS.md`

### For Users
- **In-app Help**: Available via help icon
- **FAQ Section**: https://cotrainr.app/faq
- **Email Support**: support@cotrainr.app

---

**Document Version**: 1.0
**Last Updated**: 2025
**Status**: Production Ready

---

## Summary Table

| Feature | Client | Trainer | Admin | Status |
|---------|--------|---------|-------|--------|
| Dashboard | ✅ | ✅ | ✅ | Live |
| User Profiles | ✅ | ✅ | ✅ | Live |
| Fitness Tracking | ✅ | ❌ | ❌ | Live |
| Meal Logging | ✅ | ❌ | ❌ | Live |
| Trainer Discovery | ✅ | ❌ | ❌ | Live |
| Session Booking | ✅ | ❌ | ❌ | Live |
| Video Calls | ✅ | ✅ | ❌ | Live |
| Messaging | ✅ | ✅ | ❌ | Live |
| Subscription | ✅ | ❌ | ✅ | Live |
| Payments (Razorpay) | ✅ | ❌ | ✅ | Live |
| Achievements | ✅ | ❌ | ❌ | Live |
| Leaderboard | ✅ | ❌ | ❌ | Live |
| Trainer Verification | ❌ | ❌ | ✅ | Live |
| Analytics | ❌ | ✅ | ✅ | Live |
| User Management | ❌ | ❌ | ✅ | Live |
| Multi-language | ✅ | ✅ | ✅ | Live |
| Dark/Light Theme | ✅ | ✅ | ✅ | Live |

