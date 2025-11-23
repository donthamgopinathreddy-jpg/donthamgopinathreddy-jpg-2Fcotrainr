import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class FeedService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createPost(userId: string, postData: any) {
    return this.supabaseService.createPost({
      user_id: userId,
      text: postData.text,
      image_url: postData.image_url || null,
    });
  }

  async getFeed(userId: string) {
    return this.supabaseService.getFeed(userId);
  }

  async likePost(postId: string, userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }])
      .select()
      .single();

    if (error) throw error;

    // Update post likes count
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    await supabase
      .from('posts')
      .update({ likes_count: (post?.likes_count || 0) + 1 })
      .eq('id', postId);

    return data;
  }

  async commentOnPost(postId: string, userId: string, text: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: userId, text }])
      .select()
      .single();

    if (error) throw error;

    // Update post comments count
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    await supabase
      .from('posts')
      .update({ comments_count: (post?.comments_count || 0) + 1 })
      .eq('id', postId);

    return data;
  }

  async followUser(followerId: string, followingId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unfollowUser(followerId: string, followingId: string) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower_id: followerId, following_id: followingId });

    if (error) throw error;
    return { success: true };
  }
}
