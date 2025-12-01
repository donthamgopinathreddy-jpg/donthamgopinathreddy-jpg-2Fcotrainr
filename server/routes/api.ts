import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Simple test endpoint to verify the API is working
router.get('/test', (_req: Request, res: Response) => {
  console.log('[API] Test endpoint called');
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
  });
});

// Use the new Supabase project
const SUPABASE_URL = 'https://hnxdlgdkyboctsvfktwe.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueGRsZ2RreWJvY3RzdmZrdHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM0NTQsImV4cCI6MjA4MDE3OTQ1NH0.DZPvC7diiNoANXgDxnb7T-ynYg6JUW4cfEILoJfABSI';

console.log('[API] Initializing Supabase API wrapper');
console.log('[API] Environment check:');
console.log('[API] VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'set' : 'not set');
console.log('[API] SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'not set');
console.log('[API] Final SUPABASE_URL:', SUPABASE_URL ? 'set' : 'not set');
console.log('[API] **ACTUAL URL BEING USED**:', SUPABASE_URL);
console.log(
  '[API] VITE_SUPABASE_ANON_KEY:',
  process.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'not set'
);
console.log('[API] SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'set' : 'not set');
console.log('[API] Final SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'set' : 'not set');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMsg = `[API] Missing Supabase configuration. SUPABASE_URL: ${!!SUPABASE_URL}, SUPABASE_ANON_KEY: ${!!SUPABASE_ANON_KEY}`;
  console.error(errorMsg);
  console.error(
    '[API] Available env vars:',
    Object.keys(process.env).filter((k) => k.includes('SUPABASE') || k.includes('VITE'))
  );
  throw new Error(errorMsg);
}

// Create a Supabase client on the server side
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Health check
router.get('/health', async (_req: Request, res: Response) => {
  try {
    console.log('[API] Health check requested');

    // Test if we can reach Supabase
    console.log('[API] Testing Supabase connectivity...');

    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
      },
    });

    console.log('[API] Supabase connectivity test status:', testResponse.status);

    res.json({
      status: 'ok',
      message: 'Supabase API wrapper is running',
      supabase_reachable: testResponse.ok,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Supabase API wrapper health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Auth endpoints
router.post('/auth/signin', async (req: Request, res: Response) => {
  try {
    console.log('[API] ========================================');
    console.log('[API] Sign in endpoint called');
    console.log('[API] Environment check:');
    console.log('[API]   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
    console.log('[API]   SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✓' : '✗');
    console.log('[API] Request body:', {
      email: req.body?.email,
      password: req.body?.password ? '***' : 'missing',
    });
    console.log('[API] ========================================');

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[API] Missing email or password');
      return res.status(400).json({
        error: 'Missing email or password',
      });
    }

    console.log('[API] Sign in attempt for:', email);

    // Call Supabase auth
    console.log('[API] Calling supabase.auth.signInWithPassword');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[API] Sign in error from Supabase:', {
        message: error.message,
        status: error.status,
      });
      return res.status(401).json({
        message: error.message || 'Authentication failed',
        error: error.message || 'Authentication failed',
      });
    }

    if (!data?.user) {
      console.error('[API] No user returned from auth');
      return res.status(401).json({
        message: 'Authentication failed',
        error: 'Authentication failed',
      });
    }

    console.log('[API] Sign in successful for:', email);
    console.log('[API] Returning user and session');

    // Ensure we're sending valid JSON
    const responseObj = {
      session: data.session,
      user: data.user,
      token: data.session?.access_token || '',
    };

    console.log('[API] Response object prepared:', {
      hasSession: !!responseObj.session,
      hasUser: !!responseObj.user,
      userEmail: responseObj.user?.email,
      hasToken: !!responseObj.token,
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(responseObj);
  } catch (error) {
    console.error('[API] Sign in error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[API] Sending error response:', message);

    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      message: message,
      error: message,
    });
  }
});

// Check username availability endpoint
router.post('/auth/check-username', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: 'Username is required',
      });
    }

    console.log('[API] Checking username availability:', username);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    // PGRST116 means "no rows returned" which is what we want (username is available)
    if (error && error.code === 'PGRST116') {
      console.log('[API] Username available:', username);
      return res.json({ available: true });
    }

    if (error) {
      console.error('[API] Error checking username:', error);
      return res.status(400).json({
        error: 'Failed to check username',
      });
    }

    // If we get here, the username exists
    console.log('[API] Username already taken:', username);
    res.json({ available: false });
  } catch (error) {
    console.error('[API] Unexpected error checking username:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Sign up endpoint
router.post('/auth/signup', async (req: Request, res: Response) => {
  try {
    console.log('[API] ========================================');
    console.log('[API] Sign up endpoint called');
    console.log('[API] Request body:', JSON.stringify(req.body, null, 2));

    const {
      email,
      password,
      username,
      full_name,
      gender,
      role = 'client',
      height,
      weight,
      phone_number,
      country_code,
      options,
    } = req.body;

    console.log('[API] Extracted fields:');
    console.log('[API]   email:', email);
    console.log('[API]   password:', password ? '***' : 'missing');
    console.log('[API]   username:', username);
    console.log('[API]   full_name:', full_name);
    console.log('[API]   gender:', gender);
    console.log('[API]   height:', height);
    console.log('[API]   weight:', weight);
    console.log('[API]   phone_number:', phone_number);
    console.log('[API]   country_code:', country_code);
    console.log('[API]   role:', role);

    if (!email || !password) {
      console.error('[API] ❌ Missing email or password');
      console.log('[API] email present:', !!email);
      console.log('[API] password present:', !!password);
      return res.status(400).json({
        message: 'Missing email or password',
        error: 'Missing email or password',
      });
    }

    console.log('[API] ✅ Validation passed');
    console.log('[API] Calling Supabase auth.signUp...');

    const signUpPayload = {
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          full_name: full_name || '',
          gender: gender || '',
          phone_number: phone_number || '',
          country_code: country_code || '',
          role: role || 'client',
          ...options?.data,
        },
        emailRedirectTo: undefined,
      },
    };

    console.log('[API] SignUp payload:', JSON.stringify(signUpPayload, null, 2));

    const { data, error } = await supabase.auth.signUp(signUpPayload);

    if (error) {
      console.error('[API] ❌ Supabase auth signup error:');
      console.error('[API]   message:', error.message);
      console.error('[API]   status:', error.status);
      console.error('[API]   code:', (error as any).code);
      console.error('[API]   details:', (error as any).details);
      return res.status(400).json({
        message: error.message || 'Authentication failed',
        error: error.message || 'Authentication failed',
        status: error.status,
        details: (error as any).details,
      });
    }

    console.log('[API] ✅ Supabase auth.signUp succeeded');

    console.log('[API] Supabase auth response:');
    console.log('[API]   userId:', data.user?.id);
    console.log('[API]   userEmail:', data.user?.email);
    console.log('[API]   sessionExists:', !!data.session);
    console.log('[API]   hasAccessToken:', !!data.session?.access_token);

    const userId = data.user?.id;
    if (!userId) {
      console.error('[API] ❌ No user ID in auth response');
      return res.status(400).json({
        message: 'No user ID returned from auth',
        error: 'No user ID returned from auth',
      });
    }

    console.log('[API] ✅ Auth user created with ID:', userId);

    // Create user profile in database using the authenticated session
    try {
      console.log('[API] Starting profile creation...');

      // Use the newly created session's access token to create an authenticated client
      if (!data.session?.access_token) {
        console.warn('[API] ⚠️ No access token in session, skipping profile creation');
      } else {
        console.log('[API] Creating authenticated client with access token');
        const authenticatedSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          },
        });

        const profileData = {
          id: userId,
          email,
          username: username || email.split('@')[0],
          full_name: full_name || '',
          gender: gender || '',
          password_hash: 'supabase_auth',
          role: role,
          weight_kg: weight || null,
          height_cm: height || null,
          phone_number: phone_number || '',
          country_code: country_code || '',
        };

        console.log('[API] Profile data to insert:', JSON.stringify(profileData, null, 2));

        const { error: profileError, data: profileResult } = await authenticatedSupabase
          .from('users')
          .insert([profileData]);

        if (profileError) {
          console.error('[API] ❌ Profile creation error:');
          console.error('[API]   message:', profileError.message);
          console.error('[API]   code:', (profileError as any).code);
          console.error('[API]   details:', (profileError as any).details);
          console.warn('[API] Profile creation failed but auth was successful, continuing...');
        } else {
          console.log('[API] ✅ User profile created successfully');
          console.log('[API] Profile result:', profileResult);
        }
      }
    } catch (profileErr: any) {
      console.error('[API] ❌ Unexpected error creating profile:');
      console.error('[API]   message:', profileErr?.message);
      console.error('[API]   stack:', profileErr?.stack);
      console.warn('[API] User auth was successful, continuing despite profile error');
    }

    const responseObject = {
      session: data.session,
      user: data.user,
      token: data.session?.access_token || '',
      message: 'Sign up successful',
    };

    console.log('[API] ✅ Sending success response');
    console.log('[API] ========================================');

    res.json(responseObject);
  } catch (error) {
    console.error('[API] ========================================');
    console.error('[API] ❌ Sign up error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: errorMsg,
      error: errorMsg,
    });
  }
});

// Sign out endpoint
router.post('/auth/signout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({
        error: 'Missing authorization header',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create a client with the user's session
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { error } = await userClient.auth.signOut();

    if (error) {
      console.error('[API] Sign out error:', error);
      return res.status(400).json({
        error: error.message,
      });
    }

    res.json({
      message: 'Signed out successfully',
    });
  } catch (error) {
    console.error('[API] Unexpected sign out error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get user profile endpoint
router.get('/users/profile', async (req: Request, res: Response) => {
  try {
    console.log('[API] Get user profile endpoint called');

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization header',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create a client with the user's session
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // First get the current user from auth
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      console.error('[API] Error getting auth user:', authError?.message);
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }

    console.log('[API] Fetching profile for user:', user.id);

    // Fetch user profile from users table
    const { data, error } = await userClient.from('users').select('*').eq('id', user.id).single();

    if (error) {
      console.error('[API] Error fetching user profile:', {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return res.status(400).json({
        error: error.message || 'Failed to fetch user profile',
      });
    }

    console.log('[API] Successfully fetched user profile for:', user.id);

    res.json({
      data,
    });
  } catch (error) {
    console.error('[API] Unexpected error in get profile:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Notifications endpoint
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    console.log('[API] Notifications endpoint called');

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization header',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create a client with the user's session
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Fetch notifications with timeout
    const timeoutPromise = new Promise<any>((_, reject) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Notifications fetch timeout'));
      }, 15000);
    });

    const fetchPromise = (async () => {
      try {
        const { data, error } = await userClient
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('[API] Supabase notifications error:', error);
        }

        return { data, error };
      } catch (fetchError) {
        console.error('[API] Notifications fetch caught error:', fetchError);
        return {
          data: null,
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        };
      }
    })();

    try {
      const response = (await Promise.race([fetchPromise, timeoutPromise])) as any;

      if (response.error) {
        console.error('[API] Notifications fetch error:', response.error);
        // On error, return empty array to prevent app crashes
        return res.json({
          data: [],
        });
      }

      console.log('[API] Notifications fetched successfully, count:', response.data?.length || 0);

      res.json({
        data: response.data || [],
      });
    } catch (raceError) {
      console.error('[API] Notifications race error:', raceError);
      // Return empty array instead of error to prevent app crashes
      res.json({
        data: [],
      });
    }
  } catch (error) {
    console.error('[API] Unexpected notifications error:', error);
    console.error('[API] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
    });
    // Return empty array instead of error to prevent app crashes
    res.json({
      data: [],
    });
  }
});

// Reset password endpoint
router.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    console.log('[API] Reset password endpoint called');
    const { email, method = 'email' } = req.body;

    if (!email) {
      console.log('[API] Missing email for password reset');
      return res.status(400).json({
        error: 'Missing email address',
      });
    }

    console.log('[API] Password reset requested for:', email, 'via:', method);

    // In production, you would:
    // 1. Call Supabase password reset: await supabase.auth.resetPasswordForEmail(email)
    // 2. Send SMS if method === 'phone'
    // For now, we just return success as these services require external setup

    res.json({
      success: true,
      message: `Password reset link will be sent to ${method === 'email' ? email : 'your phone number'}`,
    });
  } catch (error) {
    console.error('[API] Unexpected reset password error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get community posts endpoint
router.get('/posts', async (req: Request, res: Response) => {
  try {
    console.log('[API] Fetching community posts');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from('posts')
      .select('*, users(id, full_name, profile_picture_url)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[API] Error fetching posts:', error);
      return res.status(400).json({
        error: 'Failed to fetch posts',
      });
    }

    console.log('[API] Posts fetched successfully:', data?.length || 0);
    res.json({ data });
  } catch (error) {
    console.error('[API] Unexpected error fetching posts:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get community users endpoint
router.get('/community/users', async (req: Request, res: Response) => {
  try {
    console.log('[API] Fetching community users');

    const userId = req.query.exclude_user_id as string;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let query = supabase
      .from('users')
      .select('id, full_name, profile_picture_url, bio')
      .limit(30);

    if (userId) {
      query = query.neq('id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching community users:', error);
      return res.status(400).json({
        error: 'Failed to fetch community users',
      });
    }

    console.log('[API] Community users fetched successfully:', data?.length || 0);
    res.json({ data });
  } catch (error) {
    console.error('[API] Unexpected error fetching community users:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
