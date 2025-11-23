import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class SubscriptionsService {
  private razorpay: Razorpay;

  constructor(private readonly supabaseService: SupabaseService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createRazorpaySession(userId: string, plan: 'basic' | 'premium') {
    // Plan amounts in paise (₹199 = 19900 paise, ₹299 = 29900 paise)
    const amounts = {
      basic: 19900,
      premium: 29900,
    };

    const subscriptionData = {
      plan_id:
        plan === 'basic' ? process.env.RAZORPAY_BASIC_PLAN : process.env.RAZORPAY_PREMIUM_PLAN,
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 1 year subscription
      addons: [
        {
          item: {
            name: `CoTrainr ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            amount: amounts[plan],
            currency: 'INR',
          },
        },
      ],
    };

    try {
      const subscription = await this.razorpay.subscriptions.create(subscriptionData);
      return {
        id: subscription.id,
        short_url: subscription.short_url,
      };
    } catch (error) {
      throw new Error(`Failed to create Razorpay subscription: ${error.message}`);
    }
  }

  async handleWebhook(payload: any) {
    // Verify webhook signature
    const signature = payload.signature;
    delete payload.signature;

    // Handle subscription events
    if (payload.event === 'subscription.activated') {
      const subscriptionId = payload.payload.subscription.entity.id;
      const customerId = payload.payload.subscription.entity.customer_id;

      // Update user subscription in database
      const user = await this.supabaseService.updateUser(customerId, {
        subscription_status: 'active',
        subscription_plan: payload.plan || 'basic',
      });

      return { success: true, user };
    }

    if (payload.event === 'subscription.cancelled') {
      const customerId = payload.payload.subscription.entity.customer_id;

      await this.supabaseService.updateUser(customerId, {
        subscription_status: 'cancelled',
      });

      return { success: true };
    }

    return { success: true };
  }

  async getSubscriptionStatus(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }
}
