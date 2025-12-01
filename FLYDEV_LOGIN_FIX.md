# Fix Login Errors on Fly.dev

## The Problem
When you access your Fly.dev app, you see the login page but:
- API calls fail with "Failed to fetch"
- Console shows errors like "400 Bad Gateway"
- Login doesn't work

## Root Cause
The Express server on Fly.dev isn't properly configured to:
1. Serve the frontend (React app) 
2. Handle API requests (`/api/*`)
3. Have correct environment variables

## Solutions

### Solution 1: Set Environment Variables on Fly.dev (REQUIRED)

You MUST add these to Fly.dev:

```bash
flyctl secrets set \
  NODE_ENV=production \
  VITE_SUPABASE_URL=https://hnxdlgdkyboctsvfktwe.supabase.co \
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI
```

**Or via Fly.dev Dashboard**:
1. Go to your app dashboard
2. **Secrets** section
3. Add:
   - `NODE_ENV=production`
   - `VITE_SUPABASE_URL=https://hnxdlgdkyboctsvfktwe.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI`

### Solution 2: Redeploy After Setting Secrets

```bash
flyctl deploy
```

Or use Fly.dev Dashboard → **Deploy** button.

### Solution 3: Verify the Build

The build process must create both:
- `dist/spa/` (frontend React app)
- `dist/server/` (Express backend)

Fly.dev should automatically run:
```bash
npm run build
```

Which runs:
```bash
npm run build:client && npm run build:server
```

### Solution 4: Check Fly.dev Logs

After deployment, check logs:
```bash
flyctl logs
```

You should see:
```
[Server] ✅ Production mode: Serving static files from dist/spa
[Server] Registering /api routes
[Express] Server running on...
```

If you see "NOT serving static files", it means `NODE_ENV` is not 'production'.

## How It Works

### Before (Broken)
```
Browser
    ↓ tries to load app
    ↓ Express serves... nothing (NODE_ENV not production)
    ↓ Page goes blank or 404
```

### After (Working)
```
Browser
    ↓ GET /login
    ↓ Express serves index.html (React app)
    ↓ React loads
    ↓ User enters email/password
    ↓ POST /api/auth/signin
    ↓ Express receives on same server
    ↓ API processes, returns response
    ↓ React handles login
    ↓ Works! ✅
```

## Full Checklist

- [ ] Set `NODE_ENV=production` on Fly.dev
- [ ] Set `VITE_SUPABASE_URL` on Fly.dev
- [ ] Set `VITE_SUPABASE_ANON_KEY` on Fly.dev
- [ ] Run `flyctl deploy` or use Dashboard Deploy
- [ ] Wait 2-3 minutes for build/deployment
- [ ] Open Fly.dev URL in browser
- [ ] Check Fly.dev logs: `flyctl logs`
- [ ] Look for "✅ Production mode:" message
- [ ] Try login - should work now!

## Troubleshooting

### Still seeing blank page
1. Check Fly.dev logs: `flyctl logs`
2. Look for errors about missing dist/spa
3. Verify build is running: check "Build" section in dashboard

### Login still fails with errors
1. Check browser console (DevTools)
2. Check Fly.dev logs: `flyctl logs`
3. Verify Supabase credentials are correct
4. Make sure the API endpoint is being called (should be `/api/auth/signin`)

### "Static directory not found"
1. The build process failed
2. Check Fly.dev build logs
3. Run locally: `npm run build` to test build process
4. Check for errors in the build output

## Files Changed

1. `fly.toml` - Added Fly.dev configuration with environment variables
2. `server/routes/api.ts` - Fixed email redirect URL for Fly.dev
3. Supabase - Fixed trigger to use correct column names

## Test After Deployment

```bash
# Test API endpoint
curl https://your-app.fly.dev/api/ping

# Should return:
# {"message":"ping"}

# Test login (should not give 404 or blank page)
curl https://your-app.fly.dev/login

# Should return HTML content (not 404)
```

## Still Having Issues?

1. **Verify environment variables are set**:
   ```bash
   flyctl secrets list
   ```
   Should show:
   - NODE_ENV=production
   - VITE_SUPABASE_URL=...
   - VITE_SUPABASE_ANON_KEY=...

2. **Check that build completed successfully**:
   - Fly.dev Dashboard → Build Logs
   - Should show no errors

3. **Test API connectivity**:
   - Try the `/api/ping` endpoint
   - Should return `{"message":"ping"}`

4. **Check Supabase is reachable**:
   - Fly.dev logs should show successful Supabase connections
   - Check Supabase status: https://status.supabase.com

## Next Steps After Login Works

1. Try signup with new email
2. Verify user appears in Supabase `public.users` table
3. Check confirmation email
4. Test login with the new account
5. Explore app features
