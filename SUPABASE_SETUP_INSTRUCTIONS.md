# Supabase Setup Instructions

## 1. Apply RLS Policies

**Important**: You MUST apply these policies in your Supabase dashboard to make role-based access work.

### Steps:
1. Go to https://supabase.com/dashboard/project/nrzcsaofjeifegsiizjo/sql/new
2. Copy the entire content from `RLS_POLICIES.sql`
3. Paste it into the SQL editor
4. Click **"Run"** to execute all policies

**This will:**
- ✅ Enable Row Level Security on all tables
- ✅ Ensure users can only see their own data
- ✅ Allow trainers to see client data
- ✅ Allow admins to see everything

## 2. Update User Role

**Make yourself admin:**

1. Go to SQL Editor
2. Run this query:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'cotrainr26@gmail.com';
```

Replace `cotrainr26@gmail.com` with your actual email.

## 3. Verify RLS is Enabled

Check Authentication > Policies in Supabase dashboard - you should see:
- ✅ 10+ policies on `users` table
- ✅ Policies on `daily_stats`, `meals_logs`, `meetings`, `notifications`
- ✅ Custom functions: `is_admin()`, `is_trainer()`

## 4. Test RLS is Working

1. Sign up as a regular client account
2. Sign up as a trainer account
3. Try accessing each other's data - should be denied ✅

## 5. Admin Access Only

**Your admin email:** `cotrainr26@gmail.com`

Admin dashboard is accessible at `/admin` - only accessible to you.

### Creating More Admins (Optional):

If you want to add other admins, run:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'another-admin@email.com';
```

## 6. Common Issues & Fixes

### Issue: "new row violates row-level security policy"

**Fix**: Make sure RLS_POLICIES.sql was fully executed. Check that policies exist.

### Issue: Users seeing other users' data

**Fix**: RLS policies weren't applied. Re-run RLS_POLICIES.sql in SQL Editor.

### Issue: Admin can't see all data

**Fix**: Verify your role is set to 'admin':

```sql
SELECT id, email, role FROM users WHERE email = 'cotrainr26@gmail.com';
```

Should show `role = 'admin'`.

### Issue: Auth token not updating role

**Fix**: Clear browser cache and localStorage:
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
// Then reload page
```

## 7. Security Best Practices

✅ **Do:**
- Keep admin email secure
- Use strong passwords
- Enable 2FA in Supabase dashboard
- Regularly audit RLS policies
- Test with different user roles

❌ **Don't:**
- Share admin credentials
- Disable RLS on sensitive tables
- Hardcode user IDs in frontend
- Store sensitive data in user_metadata

## 8. Role-Based Access in Your App

### How it Works:

```typescript
// In client code:
const { userProfile } = useAuth();

if (userProfile?.role === 'admin') {
  // Show admin dashboard
} else if (userProfile?.role === 'trainer') {
  // Show trainer features
} else {
  // Show client features
}
```

### Protected Routes:

```typescript
<AdminProtectedRoute requiredRole="admin">
  <AdminDashboard />
</AdminProtectedRoute>
```

## 9. Database Structure Reminder

**3 Roles:**
1. `admin` - Full access, manage everything
2. `trainer` - Can view assigned clients, manage their schedule
3. `client` - Can view own data, book trainers

**All roles stored in `users.role` column** with constraint:
```sql
role VARCHAR(50) CHECK (role IN ('client', 'trainer', 'admin'))
```

## Next Steps

1. ✅ Apply RLS_POLICIES.sql in Supabase
2. ✅ Set your role to admin
3. ✅ Test with different user roles
4. ✅ Implement Capacitor plugins for mobile
5. ✅ Deploy to production
