# Failed to Fetch Errors - Root Cause & Fixes

## Problems Identified

### 1. Missing `follows` Table

- The `follows` table didn't exist in the database
- Both client-side code and hooks expected this table
- Result: RLS policy errors when trying to query

### 2. Message Schema Mismatch

- Client code (`useMessages.ts`) was querying using `recipient_id` column
- The actual database uses `conversation_id` model
- Messages schema: `id, conversation_id, sender_id, content, is_read, created_at`
- The code was looking for: `sender_id, recipient_id` (direct peer-to-peer model)

### 3. Missing RLS Policies

- `follows`, `conversations`, and `messages` tables existed but had no RLS policies
- When RLS is enabled without policies, all queries are blocked
- Result: "Failed to fetch" errors

## Fixes Applied

### 1. ✅ Created `follows` Table

**File**: Database migration

```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
```

### 2. ✅ Added RLS Policies for `follows`

- `Users can view follows`: Public SELECT (anyone can see who follows whom)
- `Users can follow others`: Can INSERT only if `auth.uid() = follower_id`
- `Users can unfollow`: Can DELETE only if `auth.uid() = follower_id`

### 3. ✅ Added RLS Policies for `conversations`

- `Users can view their conversations`: SELECT if participant1 or participant2
- `Users can create conversations`: INSERT if participant1 or participant2
- `Users can update their conversations`: UPDATE if participant1 or participant2

### 4. ✅ Added RLS Policies for `messages`

- `Users can view their messages`: SELECT if sender or related to conversation participant
- `Users can send messages`: INSERT if `auth.uid() = sender_id`
- `Users can update their messages`: UPDATE if `auth.uid() = sender_id`

### 5. ✅ Fixed `useMessages` Hook

**File**: `client/hooks/useMessages.ts`

**Changes**:

- **`fetchConversations()`**: Now queries `conversations` table instead of grouping messages
- **`fetchMessages()`**: Accepts `conversation_id` (or finds it from user ID if needed)
- **`sendMessage()`**: Creates or finds conversation before inserting message
- All methods handle both UUID and user ID formats for backward compatibility

**Key improvement**: Uses the actual database schema with `conversation_id` instead of trying to use non-existent `recipient_id` column

## Database Schema

### Before (What Code Expected)

```
messages:
  - sender_id
  - recipient_id  ❌ DOESN'T EXIST
  - content
```

### After (Actual Schema)

```
conversations:
  - participant1_id
  - participant2_id

messages:
  - conversation_id  ✅ Properly references a conversation
  - sender_id
  - content
```

## How RLS Policies Work

**RLS (Row Level Security)** is enabled on all three tables. This means:

1. **`follows` table**:
   - Anyone can read (see all follows)
   - Only you can insert/delete your own follows
   - Example: `Alice` can follow `Bob`, but `Bob` cannot follow himself as `Alice`

2. **`conversations` table**:
   - You can only see conversations where you're a participant
   - You can only create/update conversations you're part of
   - Example: `Alice` can see her conversation with `Bob`, but not `Bob`'s conversation with `Carol`

3. **`messages` table**:
   - You can only see messages where you're the sender or a conversation participant
   - You can only send messages where you're the sender
   - Example: `Alice` can see all her sent and received messages, but not messages between `Bob` and `Carol`

## Files Modified

1. **`client/hooks/useMessages.ts`**
   - Fixed `fetchConversations()` to use `conversations` table
   - Fixed `fetchMessages()` to use `conversation_id`
   - Fixed `sendMessage()` to create/find conversations
   - All methods now work with actual database schema

2. **`client/hooks/useFollows.ts`**
   - No changes needed (logic was correct, just missing table)
   - Now works with newly created `follows` table

## Testing

After these fixes, try:

1. **Follow/Unfollow a user**:
   - Go to user profile
   - Click follow button
   - Should work without "Failed to fetch" error
   - Check Supabase: should see entry in `follows` table

2. **Send a message**:
   - Go to Messages section
   - Start a conversation with someone
   - Send a message
   - Should see message appear
   - Check Supabase: should see entries in `conversations` and `messages` tables

3. **View conversations**:
   - Go to Messages
   - Should see list of your conversations
   - Each conversation should show last message and unread count
   - Check Supabase: queries should work without RLS errors

## Debugging

If you still see "Failed to fetch" errors:

1. **Check RLS Policies Exist**:

   ```sql
   SELECT * FROM pg_policies
   WHERE tablename IN ('follows', 'messages', 'conversations')
   ORDER BY tablename, policyname;
   ```

2. **Check Policies Are Correct**:

   ```sql
   SELECT definition FROM pg_policies
   WHERE tablename = 'follows' AND policyname = 'Users can follow others';
   ```

   Should contain: `auth.uid() = follower_id`

3. **Check User is Authenticated**:
   - In browser DevTools Console:
   - `localStorage.getItem('sb-auth-token')` should have a value
   - If empty, user is not authenticated

4. **Check Network Errors**:
   - Open DevTools → Network tab
   - Look for requests to Supabase API
   - Check response status and error messages

## Related Files

- `DEPLOYMENT_FIXES.md` - For email confirmation and deployment issues
- `RLS_POLICIES.sql` - Contains RLS policy definitions
- `SUPABASE_SCHEMA.sql` - Database schema documentation
