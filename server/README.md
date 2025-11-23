# CoTrainr Backend API

A comprehensive NestJS backend for the CoTrainr fitness application.

## Features

✅ **Authentication & Authorization**

- Email/password signup and login
- JWT-based authentication
- Role-based access control (client, trainer, admin)

✅ **User Management**

- Profile management with height, weight, BMI calculation
- User roles and verification status
- Subscription plans (free, basic, premium)

✅ **Daily Stats & Fitness Tracking**

- Log and retrieve daily stats (steps, calories, water, distance)
- Automatic reward calculation for achievements
- Health sync integration ready

✅ **Meal Tracking**

- Log meals by type (breakfast, lunch, snack, dinner)
- Track calories per meal
- Get meals by date

✅ **Trainer Discovery**

- Search trainers by category (gym, yoga, boxing, zumba, etc.)
- Location-based filtering with distance calculation
- Trainer ratings and reviews

✅ **Meetings & Scheduling**

- Create and manage training sessions
- Automatic notification to clients when trainer schedules a meeting
- Meeting link integration ready

✅ **Notifications**

- Real-time notifications for meetings, achievements, etc.
- Mark notifications as read
- Notification history

✅ **Community Feed**

- Create posts with text and images
- Like and comment on posts
- Follow/unfollow users
- Feed algorithm that shows posts from followed users

✅ **Rewards & Achievements**

- Earn coins for reaching fitness goals
- Achievement system with progress tracking
- Referral rewards

✅ **Messaging**

- 1:1 conversations between trainers and clients
- Real-time message support (WebSockets ready)
- Message history

✅ **Razorpay Subscriptions**

- Create subscription sessions
- Handle Razorpay webhooks
- Manage subscription status

## Architecture

```
src/
├── modules/
│   ├── auth/                 # Authentication & JWT
│   ├── users/                # User profiles
│   ├── stats/                # Daily fitness stats
│   ├── meals/                # Meal tracking
│   ├── trainers/             # Trainer discovery
│   ├── meetings/             # Meeting management
│   ├── notifications/        # Notifications
│   ├── feed/                 # Community feed
│   ├── rewards/              # Rewards & achievements
│   ├── messaging/            # 1:1 messaging
│   └── subscriptions/        # Razorpay integration
├── common/
│   ├── guards/               # Auth guards
│   └── supabase/             # Supabase service
├── app.module.ts             # Root module
└── main.ts                   # Entry point
```

## Installation

```bash
# Install dependencies
pnpm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your Supabase and Razorpay keys
```

## Running the Application

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login with email/password

### Users

- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile

### Stats

- `POST /stats/daily` - Log daily stats
- `GET /stats/daily` - Get stats for date range

### Meals

- `POST /meals/log` - Log a meal
- `GET /meals/logs` - Get meals by date

### Trainers

- `GET /trainers` - Search trainers (supports category, lat, lng, radius filters)
- `POST /trainers/profile` - Create trainer profile

### Meetings

- `POST /meetings` - Create a meeting
- `GET /meetings/my` - Get user's meetings

### Notifications

- `GET /notifications` - Get user notifications
- `PATCH /notifications/:id/read` - Mark as read

### Feed

- `POST /posts` - Create a post
- `GET /posts/feed` - Get feed
- `POST /posts/:id/like` - Like a post
- `POST /posts/:id/comment` - Comment on a post
- `POST /follow/:userId` - Follow a user
- `POST /unfollow/:userId` - Unfollow a user

### Messaging

- `GET /conversations` - Get conversations
- `POST /conversations` - Create conversation
- `POST /conversations/:id/messages` - Send message
- `GET /conversations/:id/messages` - Get messages

### Subscriptions

- `POST /subscriptions/create-session` - Create Razorpay session
- `GET /subscriptions/status` - Get subscription status
- `POST /subscriptions/webhook` - Razorpay webhook handler

## Database Schema

The application uses Supabase PostgreSQL with the following tables:

- `users` - User accounts and profiles
- `daily_stats` - Fitness tracking data
- `meals_logs` - Meal tracking
- `trainers` - Trainer profiles
- `meetings` - Training sessions
- `notifications` - User notifications
- `posts` - Community posts
- `comments` - Post comments
- `post_likes` - Post likes
- `follows` - User relationships
- `achievements` - Achievement definitions
- `user_achievements` - User achievement progress
- `rewards_events` - Reward history
- `conversations` - Message conversations
- `messages` - Messages
- `referrals` - Referral tracking
- `subscriptions` - Subscription management
- `trainer_verifications` - Trainer verification documents

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Create a feature branch
2. Implement your changes
3. Run tests: `pnpm run test`
4. Submit a pull request

## License

MIT
