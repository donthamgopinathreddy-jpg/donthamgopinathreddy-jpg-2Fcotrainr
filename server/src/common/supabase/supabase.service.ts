import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // User operations
  async createUser(userData: {
    email: string;
    username: string;
    password_hash: string;
    role: string;
    height_cm?: number;
    weight_kg?: number;
    phone_number?: string;
    country_code?: string;
    full_name?: string;
    gender?: string;
  }) {
    const { data, error } = await this.supabase.from('users').insert([userData]).select().single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase.from('users').select('*').eq('id', id).single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Daily stats operations
  async upsertDailyStat(userId: string, date: string, stats: any) {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .upsert({ user_id: userId, date, ...stats }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDailyStats(userId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Meals operations
  async logMeal(mealData: any) {
    const { data, error } = await this.supabase
      .from('meals_logs')
      .insert([mealData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMeals(userId: string, date: string) {
    const { data, error } = await this.supabase
      .from('meals_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;
    return data || [];
  }

  // Trainers operations
  async getTrainers(filters?: {
    category?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }) {
    let query = this.supabase.from('trainers').select(`
      *,
      users:user_id(id, username, email)
    `);

    if (filters?.category) {
      query = query.contains('categories', [filters.category]);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Client-side filtering for distance if needed
    if (filters?.latitude && filters?.longitude && filters?.radius) {
      return (data || []).filter((trainer: any) => {
        const distance = this.calculateDistance(
          filters.latitude!,
          filters.longitude!,
          trainer.location_lat,
          trainer.location_lng
        );
        return distance <= filters.radius!;
      });
    }

    return data || [];
  }

  async createTrainerProfile(trainerData: any) {
    const { data, error } = await this.supabase
      .from('trainers')
      .insert([trainerData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Meetings operations
  async createMeeting(meetingData: any) {
    const { data, error } = await this.supabase
      .from('meetings')
      .insert([meetingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserMeetings(userId: string) {
    const { data, error } = await this.supabase
      .from('meetings')
      .select('*')
      .or(`trainer_id.eq.${userId},client_id.eq.${userId}`)
      .order('starts_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Notifications operations
  async createNotification(notificationData: any) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserNotifications(userId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Feed operations
  async createPost(postData: any) {
    const { data, error } = await this.supabase.from('posts').insert([postData]).select().single();

    if (error) throw error;
    return data;
  }

  async getFeed(userId: string, limit = 20) {
    const { data: following, error: followError } = await this.supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) throw followError;

    const followingIds = (following || []).map((f: any) => f.following_id);
    followingIds.push(userId); // Include own posts

    const { data, error } = await this.supabase
      .from('posts')
      .select(
        `
        *,
        users:user_id(id, username),
        post_likes(count),
        comments(count)
      `
      )
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Rewards operations
  async createRewardEvent(userId: string, type: string, coins: number, metadata?: any) {
    const { data, error } = await this.supabase
      .from('rewards_events')
      .insert([{ user_id: userId, type, coins, metadata }])
      .select()
      .single();

    if (error) throw error;

    // Update user coins balance
    const user = await this.getUserById(userId);
    await this.updateUser(userId, {
      coins_balance: (user?.coins_balance || 0) + coins,
    });

    return data;
  }

  async getUserRewards(userId: string) {
    const { data, error } = await this.supabase
      .from('rewards_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Achievements operations
  async unlockAchievement(userId: string, achievementId: string) {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .upsert(
        {
          user_id: userId,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,achievement_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserAchievements(userId: string) {
    const { data, error } = await this.supabase
      .from('user_achievements')
      .select(
        `
        *,
        achievements:achievement_id(*)
      `
      )
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  // Messaging operations
  async createConversation(participant1: string, participant2: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .upsert(
        { participant1_id: participant1, participant2_id: participant2 },
        {
          onConflict: 'participant1_id,participant2_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async sendMessage(conversationId: string, senderId: string, text: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, sender_id: senderId, text }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConversations(userId: string) {
    const { data, error } = await this.supabase
      .from('conversations')
      .select(
        `
        *,
        participant1:participant1_id(id, username),
        participant2:participant2_id(id, username)
      `
      )
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`);

    if (error) throw error;
    return data || [];
  }

  // Helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
