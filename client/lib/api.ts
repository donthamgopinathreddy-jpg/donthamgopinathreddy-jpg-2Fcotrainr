// Use relative paths for API (proxy handles it)
// This works for both dev (Vite proxy) and production (server proxy)
const API_BASE_URL = "";

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

export function getAuthToken() {
  if (!authToken) {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
}

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { requiresAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Build the full URL
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorData: any = {};

    if (contentType?.includes("application/json")) {
      errorData = await response.json().catch(() => ({}));
    } else {
      errorData = { message: await response.text() };
    }

    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text() as any;
}

// Auth endpoints
export const authApi = {
  signup: async (data: {
    email: string;
    username: string;
    password: string;
    height?: number;
    weight?: number;
    role?: string;
  }) => {
    const response = await apiCall<{ user: any; token: string }>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    setAuthToken(response.token);
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{ user: any; token: string }>(
      "/api/auth/signin",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
    setAuthToken(response.token);
    return response;
  },

  logout: () => {
    setAuthToken(null);
  },
};

// Users endpoints
export const usersApi = {
  getProfile: async () => {
    return apiCall("/users/profile", {
      requiresAuth: true,
    });
  },

  updateProfile: async (data: any) => {
    return apiCall("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

// Stats endpoints
export const statsApi = {
  logDailyStats: async (data: any) => {
    return apiCall("/stats/daily", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  getDailyStats: async (startDate: string, endDate: string) => {
    return apiCall(`/stats/daily?startDate=${startDate}&endDate=${endDate}`, {
      requiresAuth: true,
    });
  },
};

// Meals endpoints
export const mealsApi = {
  logMeal: async (data: any) => {
    return apiCall("/meals/log", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  getMeals: async (date: string) => {
    return apiCall(`/meals/logs?date=${date}`, {
      requiresAuth: true,
    });
  },
};

// Trainers endpoints
export const trainersApi = {
  searchTrainers: async (filters?: {
    category?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.lat) params.append("lat", filters.lat.toString());
    if (filters?.lng) params.append("lng", filters.lng.toString());
    if (filters?.radius) params.append("radius", filters.radius.toString());

    return apiCall(`/trainers?${params.toString()}`);
  },

  createProfile: async (data: any) => {
    return apiCall("/trainers/profile", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

// Meetings endpoints
export const meetingsApi = {
  createMeeting: async (data: any) => {
    return apiCall("/meetings", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  getMyMeetings: async () => {
    return apiCall("/meetings/my", {
      requiresAuth: true,
    });
  },
};

// Notifications endpoints
export const notificationsApi = {
  getNotifications: async () => {
    return apiCall("/notifications", {
      requiresAuth: true,
    });
  },

  markAsRead: async (notificationId: string) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      requiresAuth: true,
    });
  },
};

// Posts/Feed endpoints
export const postsApi = {
  createPost: async (data: any) => {
    return apiCall("/posts", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },

  getFeed: async () => {
    return apiCall("/posts/feed", {
      requiresAuth: true,
    });
  },

  likePost: async (postId: string) => {
    return apiCall(`/posts/${postId}/like`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  commentOnPost: async (postId: string, text: string) => {
    return apiCall(`/posts/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify({ text }),
      requiresAuth: true,
    });
  },

  followUser: async (userId: string) => {
    return apiCall(`/follow/${userId}`, {
      method: "POST",
      requiresAuth: true,
    });
  },

  unfollowUser: async (userId: string) => {
    return apiCall(`/follow/${userId}`, {
      method: "DELETE",
      requiresAuth: true,
    });
  },
};

// Messaging endpoints
export const messagingApi = {
  getConversations: async () => {
    return apiCall("/conversations", {
      requiresAuth: true,
    });
  },

  createConversation: async (participantId: string) => {
    return apiCall("/conversations", {
      method: "POST",
      body: JSON.stringify({ participant_id: participantId }),
      requiresAuth: true,
    });
  },

  sendMessage: async (conversationId: string, text: string) => {
    return apiCall(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
      requiresAuth: true,
    });
  },

  getMessages: async (conversationId: string) => {
    return apiCall(`/conversations/${conversationId}/messages`, {
      requiresAuth: true,
    });
  },
};

// Subscriptions endpoints
export const subscriptionsApi = {
  createSession: async (plan: "basic" | "premium") => {
    return apiCall("/subscriptions/create-session", {
      method: "POST",
      body: JSON.stringify({ plan }),
      requiresAuth: true,
    });
  },

  getStatus: async () => {
    return apiCall("/subscriptions/status", {
      requiresAuth: true,
    });
  },
};
