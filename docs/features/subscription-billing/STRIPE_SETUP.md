# Stripe Integration Setup Guide

This guide will help you set up Stripe integration for your Convex SaaS application with subscription and credits functionality.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Convex project set up and running
3. Node.js and npm/pnpm installed

## Step 1: Install Dependencies

The required dependencies have already been added to package.json. Install them:

```bash
npm install
# or
pnpm install
```

## Step 2: Stripe Dashboard Setup

### Create Products and Prices

1. **Log into your Stripe Dashboard** at https://dashboard.stripe.com

2. **Create Subscription Products:**
   - Go to Products → Add Product
   - Create three products for the subscription plans:

   **Starter Plan:**
   - Name: "Starter Plan"
   - Description: "Perfect for small teams getting started"
   - Create two prices:
     - Monthly: $29.00/month (recurring)
     - Yearly: $290.00/year (recurring)

   **Pro Plan:**
   - Name: "Pro Plan" 
   - Description: "For growing teams that need more power"
   - Create two prices:
     - Monthly: $79.00/month (recurring)
     - Yearly: $790.00/year (recurring)

   **Enterprise Plan:**
   - Name: "Enterprise Plan"
   - Description: "For large organizations with custom needs"
   - Create two prices:
     - Monthly: $199.00/month (recurring)
     - Yearly: $1990.00/year (recurring)

3. **Create Credit Package Products:**
   - Go to Products → Add Product
   - Create four products for credit packages:

   **500 Credits:**
   - Name: "500 Credits"
   - Price: $15.00 (one-time)

   **1,000 Credits:**
   - Name: "1,000 Credits"
   - Price: $25.00 (one-time)

   **2,500 Credits:**
   - Name: "2,500 Credits"
   - Price: $50.00 (one-time)

   **5,000 Credits:**
   - Name: "5,000 Credits"
   - Price: $90.00 (one-time)

### Set up Webhooks

1. **Go to Developers → Webhooks** in your Stripe Dashboard
2. **Click "Add endpoint"**
3. **Set the endpoint URL** to: `https://your-convex-site.convex.site/stripe/webhook`
   - Replace `your-convex-site` with your actual Convex deployment URL
4. **Select events to listen for:**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `checkout.session.completed`
5. **Save the webhook** and copy the webhook signing secret

## Step 3: Environment Variables

Add the following environment variables to your Convex deployment:

```bash
# Get these from your Stripe Dashboard → Developers → API keys
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # From the webhook you created

# Your site URL for Stripe redirects
SITE_URL=http://localhost:3000 # Use your production URL for production
```

### Setting Environment Variables in Convex

```bash
# Set environment variables for your Convex deployment
npx convex env set STRIPE_SECRET_KEY sk_test_your_secret_key_here
npx convex env set STRIPE_WEBHOOK_SECRET whsec_your_webhook_secret_here
npx convex env set SITE_URL http://localhost:3000
```

## Step 4: Update Subscription Plans Data

Update the `convex/seedData.ts` file with your actual Stripe Price IDs:

1. **Copy the Price IDs** from your Stripe Dashboard (Products → [Product] → Pricing)
2. **Replace the placeholder Price IDs** in `convex/seedData.ts`:

```typescript
// Replace these with your actual Stripe Price IDs
stripePriceIdMonthly: "price_1234567890", // Your actual monthly price ID
stripePriceIdYearly: "price_0987654321",  // Your actual yearly price ID
```

3. **Do the same for credit packages:**

```typescript
stripePriceId: "price_credits_500_actual_id", // Your actual price ID
```

## Step 5: Seed the Database

Run the seed function to populate your database with subscription plans and credit packages:

```bash
# In your Convex dashboard or via CLI
npx convex run seedData:seedSubscriptionData
```

## Step 6: Frontend Integration

### Add Stripe to your Next.js app

Create a Stripe provider in your app:

```typescript
// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
```

Add your Stripe publishable key to `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

## Step 7: Testing

### Test Mode

1. **Use Stripe test cards** for testing:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - More test cards: https://stripe.com/docs/testing

2. **Test the subscription flow:**
   - Navigate to `/dashboard/billing`
   - Select a plan and complete checkout
   - Verify the webhook is received and processed
   - Check that credits are added to the organization

3. **Test credit purchases:**
   - Purchase additional credits
   - Verify credits are added correctly

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
# Forward events to your local webhook endpoint
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger checkout.session.completed
```

## Step 8: Production Deployment

1. **Switch to live mode** in Stripe Dashboard
2. **Update environment variables** with live keys:
   ```bash
   npx convex env set STRIPE_SECRET_KEY sk_live_your_live_secret_key
   npx convex env set SITE_URL https://your-production-domain.com
   ```
3. **Update webhook endpoint** to your production URL
4. **Test thoroughly** with real payment methods

## Usage Examples

### Consuming Credits in Your App

```typescript
import { useCredits } from '../hooks/useCredits';

function MyServiceComponent({ organizationId }) {
  const { useCreditsForService, hasEnoughCredits } = useCredits(organizationId);

  const handleServiceUsage = async () => {
    if (!hasEnoughCredits(10)) {
      alert('Not enough credits!');
      return;
    }

    try {
      await useCreditsForService(
        10, 
        'AI text generation', 
        'text-generation'
      );
      // Proceed with service
    } catch (error) {
      console.error('Failed to consume credits:', error);
    }
  };

  return (
    <button onClick={handleServiceUsage}>
      Use Service (10 credits)
    </button>
  );
}
```

### Checking Subscription Status

```typescript
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

function FeatureComponent({ organizationId }) {
  const subscription = useQuery(api.subscriptions.getOrganizationSubscription, {
    organizationId
  });

  if (!subscription || subscription.status !== 'active') {
    return <div>Please subscribe to access this feature</div>;
  }

  return <div>Premium feature content</div>;
}
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events:**
   - Check webhook URL is correct
   - Verify webhook secret is set correctly
   - Check Convex logs for errors

2. **Subscription not activating:**
   - Verify webhook events are being processed
   - Check Stripe Dashboard for subscription status
   - Look for errors in webhook processing

3. **Credits not being added:**
   - Check webhook for `invoice.payment_succeeded` events
   - Verify subscription metadata includes organizationId
   - Check credit transaction logs

### Debug Mode

Enable debug logging by adding console.log statements in your webhook handler and Stripe functions.

## Security Considerations

1. **Always verify webhook signatures** (already implemented)
2. **Use environment variables** for sensitive keys
3. **Validate all inputs** from Stripe webhooks
4. **Implement proper error handling**
5. **Use HTTPS in production**

## Support

- Stripe Documentation: https://stripe.com/docs
- Convex Documentation: https://docs.convex.dev
- Stripe Support: https://support.stripe.com