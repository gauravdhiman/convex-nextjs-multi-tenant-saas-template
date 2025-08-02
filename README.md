# Multitenant SaaS Template

A production-ready multitenant SaaS application built with Next.js, Convex, and Stripe. Features a complete subscription billing system with credit-based usage tracking, organization management, and real-time updates.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- Stripe account
- Convex account

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd convex-nextjs-multi-tenant-saas-template
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Configure your Convex and Stripe keys
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

**📖 [Complete Documentation](./docs/README.md)** - Start here for comprehensive guides and technical details.

### Quick Links
- **🛠️ [Project Setup](./docs/getting-started/SETUP.md)** - Initial project configuration
- **🔐 [Authentication](./docs/features/authentication/README.md)** - User management and OAuth
- **🏢 [Organizations](./docs/features/organizations/README.md)** - Multi-tenant management
- **💳 [Subscription Billing](./docs/features/subscription-billing/README.md)** - Complete billing system

## ✨ Features

### 🏢 Multi-Tenant Architecture
- **Organization-based isolation** with role-based access control
- **User management** with invitations and permissions
- **Secure data separation** across tenants

### 💰 Subscription & Billing
- **Flexible subscription plans** (Starter, Pro, Enterprise)
- **Credit-based usage system** with real-time tracking
- **One-time credit purchases** for overages
- **Complete audit trails** for compliance

### 🔐 Authentication & Security
- **Multiple OAuth providers** (Google, GitHub, LinkedIn)
- **Password-based authentication** with 2FA support
- **Webhook signature verification** for Stripe integration
- **Role-based authorization** throughout the system

### 🎨 Modern Tech Stack
- **Next.js 15** with React 19
- **Convex** for real-time database and functions
- **Stripe** for payment processing
- **Tailwind CSS** for styling
- **TypeScript** for type safety

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Convex Backend │    │  Stripe API     │
│                 │    │                 │    │                 │
│ • Auth UI       │◄──►│ • Database      │◄──►│ • Subscriptions │
│ • Billing UI    │    │ • Functions     │    │ • Payments      │
│ • Dashboard     │    │ • Real-time     │    │ • Webhooks      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 Core Concepts

### Organizations
Multi-tenant isolation with role-based access:
- **Owner**: Full administrative access
- **Admin**: Billing and user management
- **Member**: Standard access
- **Viewer**: Read-only access

### Credit System
Usage-based billing with credits:
- **Subscription credits**: Allocated monthly/yearly
- **Purchased credits**: One-time top-ups
- **Credit consumption**: Real-time deduction
- **Transaction history**: Complete audit trail

### Subscription Plans
Three tiers with different credit allocations:
- **Starter**: $29/month, 1,000 credits, 5 users
- **Pro**: $79/month, 5,000 credits, 25 users
- **Enterprise**: $199/month, 15,000 credits, unlimited users

## 🧪 Testing

### Subscription Flow
1. Navigate to `/dashboard/billing`
2. Select a subscription plan
3. Use Stripe test card: `4242 4242 4242 4242`
4. Verify credits are allocated

### Credit Usage
1. Go to the Demo tab in billing dashboard
2. Test credit consumption with different services
3. Watch real-time balance updates

## 🚨 Security Notes

**Before production deployment:**
- [ ] Replace hardcoded demo organization ID
- [ ] Implement rate limiting on sensitive operations
- [ ] Review error handling and logging
- [ ] Add comprehensive monitoring

See [Security Analysis](./docs/technical/SUBSCRIPTION_SYSTEM_ANALYSIS.md#security-analysis) for details.

## 🛠️ Development

### Project Structure
```
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   └── types/              # TypeScript definitions
├── convex/                 # Backend functions and schema
├── docs/                   # Documentation
└── public/                 # Static assets
```

### Key Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx convex dev       # Start Convex development
```

## 📈 Roadmap

### Immediate
- [ ] Fix security vulnerabilities
- [ ] Implement rate limiting
- [ ] Add monitoring and alerting

### Short-term
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Enhanced error handling

### Long-term
- [ ] Usage-based billing options
- [ ] Advanced reporting features
- [ ] Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **📚 Documentation**: [./docs/README.md](./docs/README.md) - Complete feature-based documentation
- **🚀 Setup Issues**: [Project Setup](./docs/getting-started/SETUP.md) - Initial configuration help
- **💳 Billing Problems**: [Subscription Billing](./docs/features/subscription-billing/README.md) - Payment system help
- **🏗️ Architecture Questions**: [Feature Documentation](./docs/README.md) - Technical deep dives

---

**Built with ❤️ using Next.js, Convex, and Stripe**
