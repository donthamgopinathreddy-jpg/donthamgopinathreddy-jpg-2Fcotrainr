import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class MessagingService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createConversation(userId1: string, userId2: string) {
    return this.supabaseService.createConversation(userId1, userId2);
  }

  async sendMessage(conversationId: string, senderId: string, text: string) {
    return this.supabaseService.sendMessage(conversationId, senderId, text);
  }

  async getConversations(userId: string) {
    return this.supabaseService.getConversations(userId);
  }

  async getMessages(conversationId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}
