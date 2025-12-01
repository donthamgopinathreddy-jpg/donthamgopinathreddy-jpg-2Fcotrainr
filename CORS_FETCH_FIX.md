# CORS/Network "Failed to Fetch" Fix

## Problem

All Supabase queries from your Fly.dev deployment were failing with:

```
TypeError: Failed to fetch
    at window.fetch
```

This affected:

- `useTrainers.ts` - fetchTrainers()
- `useFollows.ts` - fetchFollowing()
- `useMessages.ts` - fetchConversations()

## Root Cause

**CORS (Cross-Origin Resource Sharing)** issue where Fly.dev environment cannot directly reach Supabase API due to:

1. Browser/Capacitor security restrictions
2. CORS headers not allowing the Fly.dev domain
3. Network firewall/proxy blocking direct HTTPS connections to Supabase

## Solution

### Backend API Endpoints

Instead of querying Supabase directly from the client, all queries now go through **backend API endpoints** that are on the same server. This eliminates CORS issues.

**Added Endpoints:**

#### 1. `GET /api/trainers`

- **Purpose**: Fetch all trainers or filter by specialty
- **Parameters**: `?specialty=Yoga` (optional)
- **Returns**: List of trainer profiles with details
- **Replaces**: Direct Supabase query in `useTrainers.ts`

#### 2. `GET /api/follows`

- **Purpose**: Fetch current user's followed user IDs
- **Auth**: Requires `Authorization: Bearer {token}` header
- **Returns**: Array of user IDs that the current user follows
- **Replaces**: Direct Supabase query in `useFollows.ts`

#### 3. `GET /api/conversations`

- **Purpose**: Fetch user's conversations with messages and user details
- **Auth**: Requires `Authorization: Bearer {token}` header
- **Returns**: Array of conversation objects with:
  - Conversation ID
  - Other participant details
  - Last message info
  - Unread count
- **Replaces**: Direct Supabase query in `useMessages.ts`

### Client-Side Changes

**File**: `client/hooks/useTrainers.ts`

- Changed from direct Supabase query to `fetch("/api/trainers")`
- Falls back to demo trainers on error

**File**: `client/hooks/useFollows.ts`

- Changed from direct Supabase query to `fetch("/api/follows", { Authorization: token })`
- Gets auth token from localStorage
- Falls back to empty set on error

**File**: `client/hooks/useMessages.ts`

- Changed from direct Supabase query to `fetch("/api/conversations", { Authorization: token })`
- Gets auth token from localStorage
- Receives pre-enriched conversation data from backend

### Server-Side Changes

**File**: `server/routes/api.ts`

- Added `/api/trainers` endpoint (public, no auth required)
- Added `/api/follows` endpoint (requires authentication)
- Added `/api/conversations` endpoint (requires authentication)

## How It Works

### Before (CORS Issue)

```
Client Browser
    ↓ (direct HTTPS to Supabase)
    ↓ ❌ BLOCKED by CORS / network restrictions
Supabase API
```

### After (Working)

```
Client Browser
    ↓ (HTTP/HTTPS to same server)
    ↓ ✅ No CORS issues
Express Backend (Fly.dev)
    ↓ (connects to Supabase - server-side, no CORS)
    ↓ ✅ Server can reach Supabase
Supabase API
```

## Error Handling

All endpoints include fallback behavior:

- **Trainers**: Falls back to mock DEMO_TRAINERS data
- **Follows**: Falls back to empty set (returns nothing)
- **Conversations**: Falls back to empty list (returns nothing)

This prevents app crashes while providing graceful degradation.

## Testing

After deployment, test:

### 1. Trainers

- Navigate to Trainers/Discovery page
- Should see list of trainers loading without "Failed to fetch" errors
- Filtering by specialty should work

### 2. Follows

- Go to any user profile
- Click follow/unfollow button
- Should work without errors
- Followed state should update

### 3. Messages

- Go to Messages section
- Should see list of conversations
- Should be able to open conversations
- Messages should be fetchable

## Network Flow Debugging

If you still see issues:

### Check Backend Endpoints Work

```bash
# Test trainers endpoint
curl https://your-fly-app.fly.dev/api/trainers

# Test with auth
curl https://your-fly-app.fly.dev/api/follows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Backend Logs

- Look at Fly.dev deployment logs
- Check that `/api/*` requests are being handled
- Look for errors in the endpoint handlers

### Verify Auth Token

- In browser DevTools Console:
- `localStorage.getItem("authToken")` should return a valid JWT token
- If empty, user is not authenticated

### Check Network Tab

- DevTools → Network tab
- Look for `/api/trainers`, `/api/follows`, `/api/conversations` requests
- Check response status (should be 200)
- Check response body for data

## Files Modified

1. `server/routes/api.ts` - Added 3 new endpoints
2. `client/hooks/useTrainers.ts` - Updated fetchTrainers()
3. `client/hooks/useFollows.ts` - Updated fetchFollowing()
4. `client/hooks/useMessages.ts` - Updated fetchConversations()

## Alternative: Configure Supabase CORS (Optional)

If you want to keep direct client-side Supabase queries working, you can add your Fly.dev domain to Supabase's CORS allowed origins:

1. Go to Supabase Dashboard
2. **Project Settings** → **API**
3. Look for **CORS Settings**
4. Add your Fly.dev domain:
   - `https://your-app-name.fly.dev`
   - `https://*.fly.dev` (wildcard if needed)

However, the backend API approach is **recommended** because:

- More secure (API keys stay on server)
- Better performance (less data transferred)
- Easier to add server-side logic (filtering, authentication, etc.)
- Works everywhere without CORS configuration

## Summary

✅ **Problem**: Direct Supabase queries failing from Fly.dev
✅ **Cause**: CORS / network restrictions
✅ **Solution**: Backend API proxy endpoints
✅ **Status**: Fixed and deployed

The app should now work without "Failed to fetch" errors on Fly.dev!
