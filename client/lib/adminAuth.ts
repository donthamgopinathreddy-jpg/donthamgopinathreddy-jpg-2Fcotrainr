import { UserProfile } from "@/contexts/AuthContext";

/**
 * Check if a user is an admin
 * Currently, admins are identified by a specific email pattern or role
 * You can extend this to check a database field or role
 */
export const isUserAdmin = (userProfile: UserProfile | null): boolean => {
  if (!userProfile) return false;

  // Check if user has admin role
  if (userProfile.role === "admin") return true;

  // Fallback: Check a specific admin email list
  const adminEmails = ["cotrainr26@gmail.com", "admin@cotrainr.app"];

  if (adminEmails.includes(userProfile.email)) return true;

  return false;
};

/**
 * Protect admin routes
 * Use this in components to ensure only admins can access certain features
 */
export const requireAdminAccess = (
  userProfile: UserProfile | null,
): boolean => {
  return isUserAdmin(userProfile);
};
