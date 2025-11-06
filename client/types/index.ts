// User Types
export type UserRole = "client" | "trainer" | "nutritionist";
export type Gender = "male" | "female" | "other";

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

// Trainer/Nutritionist Types
export type TrainerSpecialty = "Gym" | "Zumba" | "CrossFit" | "Boxing" | "Yoga";
export type NutritionistSpecialty = "Weight Loss" | "Sports Nutrition" | "Diabetes" | "PCOS" | "General";

export interface TrainerProfile extends UserProfile {
  role: "trainer";
  bio: string;
  yearsOfExperience: number;
  specialties: TrainerSpecialty[];
  certifications: string[]; // file URLs
  idProof: string; // file URL
  isVerified: boolean;
  rating: number;
  ratingCount: number;
  pricePerSession: number;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  gallery?: string[]; // photo URLs
  totalSessions: number;
}

export interface NutritionistProfile extends UserProfile {
  role: "nutritionist";
  bio: string;
  yearsOfExperience: number;
  specialties: NutritionistSpecialty[];
  certifications: string[];
  idProof: string;
  isVerified: boolean;
  rating: number;
  ratingCount: number;
  pricePerSession: number;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
}

// Chat Types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participantIds: [string, string];
  lastMessage?: Message;
  updatedAt: string;
}

// Video Session Types
export interface VideoSession {
  id: string;
  clientId: string;
  trainerId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isTrial: boolean;
  sessionUrl?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

// Meal Tracking Types
export interface MealEntry {
  id: string;
  userId: string;
  foodName: string;
  quantity: number; // grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export interface DailyMealSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number; // liters
}

// Social Post Types
export interface Post {
  id: string;
  authorId: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  clientId: string;
  trainerId: string;
  date: string;
  time: string;
  durationMinutes: number;
  isTrial: boolean;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

// Subscription Types
export type SubscriptionPlan = "free" | "monthly" | "quarterly";

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  price: number; // in INR paise
  startDate: string;
  endDate?: string;
  stripePaymentId?: string;
  status: "active" | "cancelled" | "expired";
}

// Admin Types
export interface TrainerVerification {
  trainerId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}
