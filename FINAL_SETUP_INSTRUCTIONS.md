# 🚀 CoTrainr Complete Setup Instructions

You now have a **fully built** CoTrainr backend and frontend. Here's exactly what to do next:

---

## 📋 What You Have Ready

✅ **NestJS Backend** - All 10 feature modules implemented  
✅ **React Frontend** - Connected to backend API  
✅ **Supabase Pro Project** - Fresh database ready  
✅ **API Service Client** - Automatic request handling  
✅ **JWT Authentication** - Secure login/signup  
✅ **Database Schema SQL** - Ready to apply

---

## ⚡ Quick Setup (5 Minutes)

### Step 1️⃣: Apply Database Schema

**Fastest way to set everything up:**

1. Go to: https://app.supabase.com
2. Click on your **CoTrainr** project
3. Left sidebar → **SQL Editor** → **New Query**
4. **Copy everything** from `SUPABASE_SCHEMA.sql` (file in project root)
5. **Paste** into the SQL editor
6. Click the blue **Run** button
7. Wait for completion (shows "Success")

**What this does:**

- Creates 10 database tables (users, stats, meals, trainers, etc.)
- Sets up indexes for fast queries
- Enables Row Level Security (RLS) for data protection
- Creates all necessary constraints

---

### Step 2️⃣: Create Backend Configuration

Create `server/.env` file:

```bash
# In the project root, run:
cp server/.env.example server/.env
```

Edit `server/.env` and update these values:

```env
# Keep these as-is (from your Supabase project)
VITE_SUPABASE_URL=https://nrzcsaofjeifegsiizjo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yemNzYW9mamVpZmVnc2lpempvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDI3OTMsImV4cCI6MjA3OTQ3ODc5M30.prhv_x7tWgFeb5Dt8aosOt2AC_xFFFZ0kGfYrhVOsIk

# Change this to any random string (for JWT token signing)
JWT_SECRET=your-super-secret-key-12345-change-this

# Keep PORT as 3001
PORT=3001

# Leave Razorpay empty for now (optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_BASIC_PLAN=
RAZORPAY_PREMIUM_PLAN=
```

---

### Step 3️⃣: Install & Start Backend

```bash
# Install dependencies (takes ~2 minutes)
cd server
pnpm install

# Start backend development server
pnpm run start:dev
```

You should see:

```
🚀 CoTrainr Server running on http://localhost:3001
```

---

### Step 4️⃣: Start Frontend

**In a new terminal:**

```bash
# Go back to project root
cd ..

# Start frontend (Vite dev server)
pnpm run dev
```

You should see:

```
➜  Local:   http://localhost:8080
```

---

## ✨ Test It Works!

1. Open http://localhost:8080 in browser
2. Click **"Create Account"**
3. Fill in the form:
   ```
   Email: test@example.com
   Username: testuser
   Password: Test@123
   Height: 180 cm
   Weight: 75 kg
   Role: client
   ```
4. Click **"Get Started"**
5. You should see the dashboard! 🎉

---

## 📊 App Architecture

```
Browser (React App)
    ↓ HTTP Requests
Vite Dev Server (Port 8080)
    ↓ Proxy: /api/* → localhost:3001
NestJS Backend (Port 3001)
    ↓ CRUD Operations
Supabase PostgreSQL (Cloud)
    ↓ Stores Data
Your Database Tables
```

---

## 🔐 How It Works

### 1. **Signup Flow**

```
1. User fills signup form
2. Frontend calls: POST /auth/signup
3. Backend hashes password & creates user in database
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. User is logged in ✅
```

### 2. **Authenticated Requests**

```
All API calls after login include Authorization header:
Authorization: Bearer <your-jwt-token>

Backend validates token → Processes request → Returns data
```

### 3. **Database Security**

```
Row Level Security (RLS) policies ensure:
- Users can only see/edit their own data
- Public data (posts, trainers) is readable by all
- Admins have full access
```

---

## 📂 Project Structure

```
cotrainr/
├── client/                  # React Frontend
│   ├── pages/              # Login, Home, Dashboard, etc.
│   ├── components/         # Reusable UI components
│   ├── contexts/           # AuthContext (connected to backend)
│   ├── lib/api.ts          # 🆕 Backend API client
│   └── hooks/              # Custom React hooks
│
├── server/                  # 🆕 NestJS Backend
│   ├── src/
│   │   ├── modules/        # 10 feature modules
│   │   │   ├── auth/       # Signup/login
│   │   │   ├── users/      # Profile management
│   │   │   ├── stats/      # Fitness stats
│   │   │   ├── meals/      # Meal tracking
│   │   │   ├── trainers/   # Trainer discovery
│   │   │   ├── meetings/   # Training sessions
│   │   │   ├── notifications/
│   │   │   ├── feed/       # Community posts
│   │   │   ├── rewards/    # Achievements
│   │   │   ├── messaging/  # Chat
│   │   │   └── subscriptions/
│   │   ├── common/         # Shared utilities
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Entry point
│   ├── package.json
│   ├── .env.example        # Environment template
│   └── tsconfig.json       # TypeScript config
│
├── SUPABASE_SCHEMA.sql     # 🆕 Database schema
├── QUICK_START.md          # 🆕 Quick reference
└── vite.config.ts          # Vite + Express config
```

---

## 🔗 Connected API Endpoints

All these endpoints are **ready to use**:

### Authentication

```
POST   /auth/signup          Sign up new user
POST   /auth/login           Login with email/password
```

### Users

```
GET    /users/profile        Get your profile
PUT    /users/profile        Update profile (height, weight, etc.)
```

### Fitness Tracking

```
POST   /stats/daily          Log steps, calories, water, distance
GET    /stats/daily?range=7d Get stats for charts
POST   /meals/log            Log a meal
GET    /meals/logs?date=     Get meals for a specific day
```

### Social Features

```
POST   /posts                Create a post
GET    /posts/feed           Get your feed
POST   /follow/:userId       Follow a user
POST   /posts/:id/like       Like a post
```

### Trainer Features

```
GET    /trainers?category=yoga&lat=&lng=&radius=  Search trainers
POST   /trainers/profile     Create trainer profile
POST   /meetings             Schedule a training session
```

### More Features

```
GET    /notifications        Get your notifications
POST   /conversations        Start a conversation
POST   /conversations/:id/messages  Send a message
POST   /subscriptions/create-session  Start Razorpay subscription
```

---

## 🎨 Design Preview

Your app includes:

✅ **Modern UI**

- Glass-morphism design
- Orange/Blue color scheme
- Smooth animations
- Mobile responsive

✅ **Features**

- User authentication
- Profile management
- Fitness tracking
- Social feed
- Messaging
- Training sessions
- Achievement system
- Subscription plans

---

## 🧪 Test Features

### Test Signup/Login

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "height": 180,
    "weight": 75,
    "role": "client"
  }'
```

### Test with Token (Copy token from signup response)

```bash
curl http://localhost:3001/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚙️ Common Tasks

### Restart Frontend

```bash
# Press Ctrl+C in the terminal, then:
pnpm run dev
```

### Restart Backend

```bash
# Press Ctrl+C in the server terminal, then:
cd server
pnpm run start:dev
```

### Check Backend Logs

Look at the terminal where you ran `pnpm run start:dev`. You'll see all API requests:

```
[Server] POST /auth/signup
[Server] POST /auth/login
[Server] GET /users/profile
```

### Check Database

1. Go to Supabase dashboard
2. Click **Table Editor**
3. View tables: users, daily_stats, meals_logs, etc.
4. Check data is being created

---

## 🚨 If Something Goes Wrong

### Error: "Cannot find module '@/lib/api'"

**Fix**: Restart Vite dev server

```bash
# Press Ctrl+C, then:
pnpm run dev
```

### Error: "ECONNREFUSED 127.0.0.1:3001"

**Fix**: Backend not running. In a new terminal:

```bash
cd server
pnpm run start:dev
```

### Error: "Supabase connection failed"

**Fix**: Check `.env` has correct credentials:

```
VITE_SUPABASE_URL=https://nrzcsaofjeifegsiizjo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Error: "401 Unauthorized"

**Fix**: Your JWT token expired. Log out and log back in.

---

## 📈 Next Steps

Once everything is working:

### 1. Build More Features

- [ ] Admin dashboard
- [ ] Video calling (Agora SDK)
- [ ] File uploads (trainer verification docs)
- [ ] Email notifications
- [ ] Advanced search filters

### 2. Improve Design

- [ ] Custom branding
- [ ] Responsive mobile layout
- [ ] Dark mode
- [ ] Loading skeletons

### 3. Testing

- [ ] Write unit tests
- [ ] Integration tests
- [ ] E2E tests

### 4. Deploy

When ready to go live:

- Deploy backend to: Railway, Render, or AWS
- Deploy frontend to: Netlify or Vercel
- Database: Already hosted on Supabase

---

## 📚 Documentation

- **Backend API**: `server/README.md`
- **Setup Guide**: `COTRAINR_SETUP_GUIDE.md`
- **Quick Reference**: `QUICK_START.md`
- **NestJS Docs**: https://docs.nestjs.com
- **Supabase Docs**: https://supabase.com/docs

---

## ✅ Final Checklist

Before you start developing:

- [ ] Applied SQL schema to Supabase ✓
- [ ] Created `server/.env` file ✓
- [ ] Ran `pnpm install` in server/ ✓
- [ ] Backend running on port 3001 ✓
- [ ] Frontend running on port 8080 ✓
- [ ] Successfully logged in ✓
- [ ] Can see user dashboard ✓

---

## 🎉 You're Ready!

Your CoTrainr app is **fully functional** with:

- ✅ Complete backend API (NestJS)
- ✅ Frontend connected to backend
- ✅ Secure authentication (JWT)
- ✅ Production database (Supabase)
- ✅ All 10 feature modules ready

**Start building amazing features! 🚀**

---

## 💬 Questions?

If you get stuck:

1. Check the error message carefully
2. Look at server logs (the terminal where backend is running)
3. Check browser console (F12 → Console)
4. Review the documentation files in the project

You've got this! 💪
