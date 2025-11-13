# Razorpay Payment Integration Setup

## Overview

This app has been integrated with Razorpay for processing payments for trainer bookings, subscriptions, and other services.

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Copy your **Key ID** (public key)
4. Keep your **Key Secret** safe (server-side use only)

### 2. Add Environment Variables

Add the following to your `.env.local` file:

```
# Razorpay Configuration
VITE_RAZORPAY_KEY=your_razorpay_key_id_here
```

### 3. Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle payment verification:

1. Go to Settings → Webhooks in Razorpay Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.authorized`, `payment.failed`, `payment.captured`
4. Copy your webhook secret

## Features Implemented

### Payment Processing

- **Trainer Bookings**: Users can book trainers and pay through Razorpay
- **Amount Calculation**: Hourly rates × duration
- **Discount Codes**: Apply referral codes for discounts
- **Payment History**: Track all payments in the database

### Payment Flow

1. User selects trainer and booking details
2. User can optionally apply referral code for discount
3. Payment processed through Razorpay modal
4. On success, booking is created and user is notified
5. Payment record saved to database

## Database Schema

### payments table

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- amount_cents: INT (amount in paise)
- currency: VARCHAR (default 'INR')
- description: TEXT
- razorpay_order_id: VARCHAR
- razorpay_payment_id: VARCHAR
- status: VARCHAR ('pending', 'completed', 'failed')
- payment_method: VARCHAR
- discount_code: VARCHAR (referral code used)
- discount_amount_cents: INT
- booking_id: UUID (foreign key)
- trainer_id: UUID (foreign key)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Hook Usage

### usePayments()

```typescript
const { processPayment, createPaymentOrder, applyDiscount, getPaymentHistory } =
  usePayments();

// Process payment through Razorpay
const success = await processPayment(
  amountInPaise,
  "Trainer Session",
  discountCode,
  discountAmountInPaise,
);

// Calculate discount
const { finalAmount, discountAmount } = applyDiscount(baseAmount, percentage);

// Get payment history
const payments = await getPaymentHistory();
```

## Testing

### Test Cards (Razorpay Sandbox)

- **Success**: 4111 1111 1111 1111
- **Decline**: 5555 5555 5555 4444
- **OTP**: 123456
- **Card Name**: Any name
- **Expiry**: Any future date

## Security Notes

1. **Never commit** VITE_RAZORPAY_KEY or Key Secret to git
2. Use `.env.local` for local development
3. For production, use environment variables set in your hosting platform
4. Validate payments server-side using Key Secret
5. Enable webhook signature verification in production

## Related Features

- **Referral System**: 10% discount on first booking for referred users
- **Leaderboard**: Track top performers (monthly/all-time)
- **Achievements**: Unlock badges for milestones
- **User Streaks**: Daily streak tracking

## Troubleshooting

### "Razorpay is not defined"

- Check that VITE_RAZORPAY_KEY is set
- Razorpay script might not have loaded - check console for errors

### Payment shows "pending" but user not charged

- Check Razorpay dashboard for payment status
- Verify webhook is configured for production

### Discount not applying

- Ensure referral code exists and is not used
- Check referral code hasn't expired

## Next Steps

1. Set VITE_RAZORPAY_KEY environment variable
2. Test payment flow with test cards
3. Link booking flow to trigger payment page
4. Set up production Razorpay account for real payments
5. Configure webhooks for payment verification
