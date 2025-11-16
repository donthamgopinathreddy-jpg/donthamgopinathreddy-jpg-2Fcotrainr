import { UserProfile } from "@/contexts/AuthContext";

/**
 * Check if a user is an admin
 * Currently, admins are identified by a specific email pattern or role
 * You can extend this to check a database field or role
 */
export const isUserAdmin = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;

  // Check if user has admin role (extend role type when needed)
  // For now, you can customize this based on your requirements:
  // Option 1: Check email domains
  // if (userProfile.email?.endsWith("@cotrainr.app")) return true;

  // Option 2: Check a specific admin list
  const adminEmails = [
    "cotrainr26@gmail.com",
    "admin@cotrainr.app",
  ];

  if (adminEmails.includes(userProfile.email)) return true;

  // Option 3: You can add an is_admin field to users table and check it here
  // if ((userProfile as any).is_admin) return true;

  return false;
};

/**
 * Protect admin routes
 * Use this in components to ensure only admins can access certain features
 */
export const requireAdminAccess = (userProfile: UserProfile | null): boolean => {
  return isUserAdmin(userProfile);
};
