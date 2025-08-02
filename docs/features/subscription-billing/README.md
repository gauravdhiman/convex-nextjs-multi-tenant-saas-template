# Subscription & Billing System

A complete credit-based subscription billing system with Stripe integration, real-time usage tracking, and multi-tenant support.

## 📋 Overview

This feature provides a comprehensive billing solution with:
- **Subscription plans** with different credit allocations
- **One-time credit purchases** for overages
- **Real-time credit consumption** tracking
- **Complete audit trails** for compliance
- **Multi-tenant organization billing**

## 🚀 Quick Start

### 1. Basic Setup
Follow the [Getting Started Guide](../../getting-started/SETUP.md) first, then return here for billing-specific setup.

### 2. Stripe Integration
Complete the [Stripe Setup Guide](./STRIPE_SETUP.md) to configure payment processing.

### 3. Test the System
Navigate to `/dashboard/billing` to test subscription flows and credit management.

## 📚 Documentation

### Setup & Configuration
- **[Stripe Setup Guide](./STRIPE_SETUP.md)** - Complete Stripe configuration walkthrough
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - What's been built and how to use it
- **[Integration Guide](./README_STRIPE_INTEGRATION.md)** - Stripe integration completion guide

### Technical Deep Dive
- **[System Analysis](./SUBSCRIPTION_SYSTEM_ANALYSIS.md)** - Complete technical architecture, security analysis, and data flows

## 🏗️ Architecture

### Core Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Convex Backend │    │  Stripe API     │
│                 │    │                 │    │                 │
│ • Billing Page  │◄──►│ • Subscriptions │◄──►│ • Subscriptions │
│ • Credit Status │    │ • Credits       │    │ • Payments      │
│ • Plan Selection│    │ • Transactions  │    │ • Webhooks      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Tables
- **`subscriptions`** - Active subscription state per organization
- **`subscriptionPlans`** - Available plans and pricing
- **`credits`** - Current credit balances and usage summaries
- **`creditTransactions`** - Complete audit trail of credit changes
- **`creditPackages`** - One-time credit purchase options
- **`stripeEvents`** - Webhook event tracking for idempotency

## 💳 Subscription Plans

| Plan | Monthly | Yearly | Credits | Users | Features |
|------|---------|--------|---------|-------|----------|
| **Starter** | $29 | $290 | 1,000 | 5 | Basic features |
| **Pro** | $79 | $790 | 5,000 | 25 | Advanced features |
| **Enterprise** | $199 | $1,990 | 15,000 | Unlimited | Enterprise features |

## 🪙 Credit System

### Credit Sources
- **Subscription Credits**: Automatically allocated on subscription creation/renewal
- **Purchased Credits**: One-time purchases for additional credits
- **Promotional Credits**: Manual adjustments for promotions/refunds

### Credit Usage
Credits are consumed when users utilize services:
```typescript
// Example: Consume credits for AI text generation
await useCreditsForService(10, "AI Text Generation", "ai-text");
```

### Credit Packages
- **500 Credits**: $15.00 ($0.03 per credit)
- **1,000 Credits**: $25.00 ($0.025 per credit)
- **2,500 Credits**: $50.00 ($0.02 per credit)
- **5,000 Credits**: $90.00 ($0.018 per credit)

## 🔧 Implementation Guide

### Adding Credit Consumption to Your Services

1. **Import the credits hook:**
```typescript
import { useCredits } from '../hooks/useCredits';
```

2. **Check and consume credits:**
```typescript
function MyService({ organizationId }) {
  const { useCreditsForService, hasEnoughCredits } = useCredits(organizationId);

  const handleServiceUsage = async () => {
    if (!hasEnoughCredits(10)) {
      alert('Not enough credits! Please upgrade or purchase more.');
      return;
    }

    try {
      await useCreditsForService(10, 'AI Service Usage', 'ai-service');
      // Proceed with your service logic
    } catch (error) {
      console.error('Credit consumption failed:', error);
    }
  };

  return <button onClick={handleServiceUsage}>Use Service (10 credits)</button>;
}
```

### Backend Credit Consumption
For services that run on the backend:
```typescript
// In your Convex function
await ctx.runMutation(internal.subscriptions.addCredits, {
  organizationId,
  amount: -tokensUsed, // Negative for consumption
  type: "used",
  description: `AI processing: ${tokensUsed} tokens`,
  metadata: { serviceUsed: "ai-processing", userId }
});
```

## 🧪 Testing

### Test Cards (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

### Testing Workflow
1. **Subscription Creation**: Go to `/dashboard/billing` → Plans → Subscribe
2. **Credit Usage**: Use the Demo tab to test credit consumption
3. **Credit Purchase**: Buy additional credits via Credits tab
4. **Webhook Testing**: Use Stripe CLI to test webhook events

## 🚨 Security Considerations

### Before Production
- [ ] Replace hardcoded demo organization ID
- [ ] Implement rate limiting on billing operations
- [ ] Add comprehensive error handling and logging
- [ ] Set up monitoring and alerting

### Security Features
- ✅ Webhook signature verification
- ✅ Role-based access control (only admins/owners can manage billing)
- ✅ Input validation on all billing operations
- ✅ Idempotent webhook processing

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **Monthly Recurring Revenue (MRR)**
- **Credit utilization rates**
- **Subscription churn**
- **Failed payment rates**
- **Credit purchase patterns**

### Available Data
- Credit transaction history with service attribution
- Subscription lifecycle events
- Payment success/failure rates
- User engagement with billing features

## 🔄 Webhook Events

The system handles these Stripe webhook events:
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancellation
- `invoice.payment_succeeded` - Successful payment (adds credits)
- `checkout.session.completed` - Successful credit purchase

## 🛠️ Customization

### Adding New Subscription Plans
1. Create products/prices in Stripe Dashboard
2. Update `convex/seedData.ts` with new plan details
3. Run `npx convex run seedData:seedSubscriptionData`

### Adding New Credit Packages
1. Create new price in Stripe Dashboard
2. Update credit packages in `convex/seedData.ts`
3. Reseed the database

### Modifying Credit Costs
Update your service functions to consume different credit amounts based on usage patterns.

## 📈 Roadmap

### Immediate
- [ ] Rate limiting implementation
- [ ] Enhanced error handling
- [ ] Monitoring dashboard

### Short-term
- [ ] Usage-based billing options
- [ ] Advanced analytics
- [ ] Multi-currency support

### Long-term
- [ ] Enterprise billing features
- [ ] Advanced reporting
- [ ] API for external integrations

## 🆘 Troubleshooting

### Common Issues
- **Subscription not activating**: Check webhook configuration and logs
- **Credits not being added**: Verify webhook events are being processed
- **Checkout failures**: Ensure Stripe keys are correctly configured

### Debug Resources
- Convex dashboard function logs
- Stripe dashboard event logs
- Browser console for frontend errors
- Network tab for API request inspection

---

**Need help?** Check the [System Analysis](./SUBSCRIPTION_SYSTEM_ANALYSIS.md) for detailed technical information or the [Setup Guide](./STRIPE_SETUP.md) for configuration issues.