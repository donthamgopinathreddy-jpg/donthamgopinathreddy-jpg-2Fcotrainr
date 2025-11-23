# CoTrainr - Quick Start Guide

## 🎯 What You Have

✅ **Fresh Supabase Project** (Pro plan, ap-south region)
✅ **Complete NestJS Backend** (10 feature modules)
✅ **React Frontend** (Connected to backend)
✅ **Database Schema** (All tables ready)

---

## 🚀 Step 1: Apply Database Schema

### 1.1 Go to Supabase Dashboard

1. Visit https://app.supabase.com
2. Select your **CoTrainr** project
3. Click **SQL Editor** → **New Query**

### 1.2 Apply the Schema

1. Copy the entire content of the `SUPABASE_SCHEMA.sql` file (in project root)
2. Paste it into the SQL Editor
3. Click **Run**

✅ This creates all tables, indexes, and Row Level Security (RLS) policies.

---

## 🔧 Step 2: Configure Environment Variables

### 2.1 Backend Configuration

Create `server/.env`:

```bash
# Copy from template
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase (from your Supabase dashboard)
VITE_SUPABASE_URL=https://nrzcsaofjeifegsiizjo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-key-change-this-to-something-random

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_BASIC_PLAN=plan_xxxxx
RAZORPAY_PREMIUM_PLAN=plan_xxxxx
```

### 2.2 Frontend Configuration

Your frontend is already configured with the Supabase variables!

---

## 📦 Step 3: Install Dependencies

```bash
# Backend
cd server
pnpm install
cd ..

# Frontend (if needed)
pnpm install
```

---

## ▶️ Step 4: Run the Application

### Terminal 1: Frontend (React + Vite)

```bash
pnpm run dev
```

Opens at: **http://localhost:8080**

### Terminal 2: Backend (NestJS)

```bash
cd server
pnpm run start:dev
```

Runs at: **http://localhost:3001**

The Vite proxy automatically routes `/api/*` requests to `http://localhost:3001`.

---

## ✨ Step 5: Test the App

### Try the Login Flow

1. Go to http://localhost:8080/login
2. Click **"Create Account"**
3. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Height: `180` cm
   - Weight: `75` kg
   - Role: `client`
4. Click **"Get Started"**
5. You should be logged in and see the dashboard!

---

## 🏗️ Architecture Overview

### Backend Structure

```
server/src/
├── modules/
│   ├── auth/              # Signup/login
│   ├── users/             # Profile management
│   ├── stats/             # Daily fitness stats
│   ├── meals/             # Meal tracking
│   ├── trainers/          # Trainer discovery
│   ├── meetings/          # Training sessions
│   ├── notifications/     # Alerts
│   ├── feed/              # Community posts
│   ├── rewards/           # Achievements, coins
│   ├── messaging/         # 1:1 chat
│   └── subscriptions/     # Razorpay
├── common/
│   ├── guards/            # Auth guards
│   └── supabase/          # Database service
└── main.ts                # Entry point
```

### Frontend Connection

```
client/
├── contexts/AuthContext.tsx    # Connected to backend API
├── lib/api.ts                  # Backend API client
├── pages/                      # React pages
├── components/                 # UI components
└── App.tsx                     # Root component
```

---

## 🔗 API Endpoints (All Connected!)

| Feature           | Endpoints                                                         |
| ----------------- | ----------------------------------------------------------------- |
| **Auth**          | `POST /auth/signup`, `POST /auth/login`                           |
| **Users**         | `GET /users/profile`, `PUT /users/profile`                        |
| **Stats**         | `POST /stats/daily`, `GET /stats/daily?startDate=&endDate=`       |
| **Meals**         | `POST /meals/log`, `GET /meals/logs?date=`                        |
| **Trainers**      | `GET /trainers?category=&lat=&lng=&radius=`                       |
| **Meetings**      | `POST /meetings`, `GET /meetings/my`                              |
| **Notifications** | `GET /notifications`, `PATCH /notifications/:id/read`             |
| **Posts**         | `POST /posts`, `GET /posts/feed`                                  |
| **Messaging**     | `GET /conversations`, `POST /conversations/:id/messages`          |
| **Subscriptions** | `POST /subscriptions/create-session`, `GET /subscriptions/status` |

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/lib/api'"

**Solution**: Clear Vite cache and restart dev server:

```bash
rm -rf node_modules/.vite
pnpm run dev
```

### Issue: "API Error: 404"

**Solution**: Make sure backend is running on port 3001:

```bash
cd server
pnpm run start:dev
```

### Issue: "CORS error"

**Solution**: The backend has CORS enabled for localhost. Make sure frontend URL matches:

```env
FRONTEND_URL=http://localhost:8080
```

### Issue: "Supabase connection failed"

**Solution**: Check your `.env` file has correct credentials:

```bash
VITE_SUPABASE_URL=https://nrzcsaofjeifegsiizjo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue: "Cannot POST /auth/signup"

**Solution**: Backend might not have loaded the modules. Check server logs:

```
[App] Registering /auth routes
[Server] POST /auth/signup
```

---

## 📚 Next Steps

### 1. Add More Features

- Implement admin dashboard
- Add real-time WebSocket notifications
- Integrate video calling (Agora, Jitsi)
- Add file uploads (profile pictures, documents)

### 2. Customize Design

- Update Colors/Theme
- Add brand assets
- Implement dark mode
- Add animations

### 3. Testing

```bash
# Run tests
pnpm run test

# Run E2E tests
pnpm run test:e2e
```

### 4. Deploy

- **Frontend**: Deploy to Netlify/Vercel
- **Backend**: Deploy to Railway/Render/AWS
- **Database**: Already on Supabase (auto-hosted)

---

## 📞 Support

- **Backend Issues**: Check `server/README.md`
- **Database Issues**: Check Supabase dashboard
- **Frontend Issues**: Check React console (F12)
- **Connection Issues**: Check vite.config.ts proxy settings

---

## ✅ Checklist

- [ ] Applied SQL schema to Supabase
- [ ] Created `server/.env` with correct credentials
- [ ] Installed dependencies: `pnpm install` (root + server)
- [ ] Frontend running: `pnpm run dev`
- [ ] Backend running: `cd server && pnpm run start:dev`
- [ ] Successfully signed up and logged in
- [ ] Can see dashboard with profile info

---

## 🎉 You're All Set!

Your CoTrainr app is now fully connected with:
✅ Backend API (NestJS + PostgreSQL)
✅ Frontend (React + TypeScript)
✅ Authentication (JWT)
✅ Database (Supabase)

Start building features! 🚀
