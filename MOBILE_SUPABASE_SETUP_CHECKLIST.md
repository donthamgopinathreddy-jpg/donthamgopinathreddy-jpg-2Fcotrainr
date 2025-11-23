# Mobile & Supabase Setup Complete Checklist

## ✅ What's Already Implemented

### 1. **Role-Based Access Control (RBAC)**
- ✅ 3 Roles created: `client`, `trainer`, `admin`
- ✅ Admin route protection already in place (`AdminRoute` component)
- ✅ Your email set as admin: `cotrainr26@gmail.com`
- ✅ Admin functions exist: `isUserAdmin()`, `requireAdminAccess()`

### 2. **Mobile App Support**
- ✅ Capacitor core installed and configured
- ✅ Android & iOS support setup
- ✅ API fixed to work with mobile (relative paths instead of localhost)
- ✅ Mobile pages created (MobileHome, MobileDiscover, MobileMeals, etc.)

### 3. **Authentication**
- ✅ Sign up & Login working with Supabase Auth
- ✅ Error handling for mobile API calls
- ✅ Token management working

---

## 🔴 CRITICAL: What You MUST DO NOW

### Step 1: Apply RLS Policies in Supabase (REQUIRED)

**⚠️ Without this, role-based access won't work!**

1. Go to: https://supabase.com/dashboard/project/nrzcsaofjeifegsiizjo/sql/new
2. Copy all content from `RLS_POLICIES.sql` file (in project root)
3. Paste into Supabase SQL editor
4. Click **"Run"** button

**This enables:**
- Users can only see their own data
- Trainers can see client data
- Admins see everything
- Signup works properly

### Step 2: Update Your Admin Role in Supabase

In the same SQL editor, run:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'cotrainr26@gmail.com';
```

### Step 3: Disable Email Confirmation (Optional but Recommended)

Go to Supabase → Authentication → Providers → Email:
- Toggle OFF "Confirm email"

This lets users sign up and login immediately without email verification.

---

## 🟡 Recommended: Add Capacitor Plugins for Mobile

Run in terminal:

```bash
# Install plugins
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/local-notifications
npm install @capacitor/device

# Sync changes
npx cap sync
```

**These enable:**
- 📷 Camera for profile pictures & meal photos
- 📍 Location for finding trainers nearby
- 🔔 Push notifications & reminders
- 📱 Device info for analytics

See `CAPACITOR_MOBILE_SETUP.md` for detailed Android/iOS configuration.

---

## 🔧 How the 3 Roles Work

### Client Role
- Can view own data only
- Can book trainers
- Can log meals & workouts
- Cannot see other users' data
- Cannot access `/admin`

### Trainer Role
- Can view own profile
- Can view assigned clients' data
- Can manage their schedule
- Cannot access `/admin`
- Can update own trainer profile

### Admin Role
- ✅ Full access to ALL data
- ✅ Can access `/admin` dashboard
- ✅ Can manage users, roles, content
- ✅ Can see all trainers, clients, meetings
- Access: **Only you** (`cotrainr26@gmail.com`)

---

## 🧪 Testing Role-Based Access

### Test 1: Login as Admin
1. Go to app login
2. Login with: `cotrainr26@gmail.com` (your admin email)
3. Visit `/admin` → Should work ✅
4. You should see Admin Dashboard

### Test 2: Login as Client
1. Create new account with any email (e.g., `client@test.com`)
2. Visit `/admin` → Should see "Access Denied" ✅
3. Can only see own data

### Test 3: Login as Trainer
1. Create account, then manually set role in Supabase:
```sql
UPDATE users 
SET role = 'trainer' 
WHERE email = 'trainer@test.com';
```
2. Login as trainer
3. Visit `/admin` → Should see "Access Denied" ✅
4. Can see assigned client data

---

## 📱 Mobile Deploy Checklist

Before deploying to mobile:

- [ ] Apply RLS policies in Supabase
- [ ] Test signup/login works
- [ ] Test different user roles
- [ ] Capacitor plugins installed (optional)
- [ ] Deploy to Netlify/production
- [ ] Test on actual mobile device

---

## 🚀 Next Steps

1. **RIGHT NOW**: 
   - [ ] Apply RLS_POLICIES.sql in Supabase
   - [ ] Update your admin role

2. **THIS WEEK**:
   - [ ] Test signup/login with 3 different roles
   - [ ] Verify admin dashboard only accessible to you
   - [ ] Test mobile login works

3. **OPTIONAL**:
   - [ ] Add Capacitor plugins for better mobile experience
   - [ ] Implement camera for profile pictures
   - [ ] Add location tracking for trainers

4. **THEN**:
   - [ ] Deploy to Netlify
   - [ ] Test on mobile devices
   - [ ] Monitor for any RLS violations

---

## 📞 If Something Goes Wrong

### Issue: "new row violates row-level security policy" on signup
**Fix**: RLS policies weren't applied. Go back and run RLS_POLICIES.sql

### Issue: Users can see other users' data
**Fix**: RLS policies not working. Check they were applied in Supabase.

### Issue: Admin can't access `/admin`
**Fix**: Your role isn't set to 'admin'. Run the UPDATE query above.

### Issue: Mobile login still fails
**Fix**: Clear browser cache & localStorage:
```javascript
// In browser console:
localStorage.clear();
// Then refresh
```

---

## 📊 Security Summary

✅ **What's Secure:**
- Passwords handled by Supabase Auth
- RLS policies enforce access control
- Admin-only routes protected
- Tokens managed securely

🔒 **Admin Access:**
- Only `cotrainr26@gmail.com` has admin access
- Cannot be given to other users via UI
- Requires SQL UPDATE to change

---

## Files Created

1. **RLS_POLICIES.sql** - Row Level Security policies (MUST apply in Supabase)
2. **CAPACITOR_MOBILE_SETUP.md** - Mobile plugin setup guide
3. **SUPABASE_SETUP_INSTRUCTIONS.md** - Detailed Supabase instructions
4. **client/components/AdminProtectedRoute.tsx** - Reusable admin protection component

---

**Status**: 🟢 Ready for RLS policy application in Supabase
