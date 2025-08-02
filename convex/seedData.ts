import { mutation } from "./_generated/server";

// Mutation to seed subscription plans and credit packages (safe to run multiple times)
export const seedSubscriptionData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let plansCreated = 0;
    let plansUpdated = 0;
    let packagesCreated = 0;
    let packagesUpdated = 0;

    // Create subscription plans
    const plans = [
      {
        planId: "starter",
        name: "Starter",
        description: "Perfect for small teams getting started",
        stripePriceIdMonthly: "price_1RrCzoDCTx1JlMd89ewbn7Qz", // Replace with actual Stripe price IDs
        stripePriceIdYearly: "price_1RrUlPDCTx1JlMd82SFFvTUW",
        monthlyPrice: 2900, // $29.00
        yearlyPrice: 29000, // $290.00 (2 months free)
        currency: "usd",
        creditsIncluded: 1000,
        features: [
          "1,000 credits per month",
          "Up to 5 team members",
          "Basic analytics",
          "Email support",
          "API access"
        ],
        maxUsers: 5,
        maxProjects: 10,
        isActive: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        planId: "pro",
        name: "Pro",
        description: "For growing teams that need more power",
        stripePriceIdMonthly: "price_1RrD20DCTx1JlMd8fb9epqak",
        stripePriceIdYearly: "price_1RrUkGDCTx1JlMd8KwE7fFgs",
        monthlyPrice: 7900, // $79.00
        yearlyPrice: 79000, // $790.00 (2 months free)
        currency: "usd",
        creditsIncluded: 5000,
        features: [
          "5,000 credits per month",
          "Up to 25 team members",
          "Advanced analytics",
          "Priority support",
          "API access",
          "Custom integrations",
          "Advanced security"
        ],
        maxUsers: 25,
        maxProjects: 50,
        isActive: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        planId: "enterprise",
        name: "Enterprise",
        description: "For large organizations with custom needs",
        stripePriceIdMonthly: "price_1RrU9ADCTx1JlMd86E0NQhYu",
        stripePriceIdYearly: "price_1RrUmuDCTx1JlMd8cIDZVGx5",
        monthlyPrice: 19900, // $199.00
        yearlyPrice: 199000, // $1990.00 (2 months free)
        currency: "usd",
        creditsIncluded: 15000,
        features: [
          "15,000 credits per month",
          "Unlimited team members",
          "Enterprise analytics",
          "24/7 phone support",
          "API access",
          "Custom integrations",
          "Enterprise security",
          "SSO integration",
          "Custom contracts",
          "Dedicated account manager"
        ],
        maxUsers: undefined, // unlimited
        maxProjects: undefined, // unlimited
        isActive: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Upsert subscription plans
    for (const plan of plans) {
      const existingPlan = await ctx.db
        .query("subscriptionPlans")
        .withIndex("by_plan_id", (q) => q.eq("planId", plan.planId))
        .first();

      if (existingPlan) {
        // Update existing plan
        await ctx.db.patch(existingPlan._id, {
          ...plan,
          updatedAt: now,
        });
        plansUpdated++;
      } else {
        // Create new plan
        await ctx.db.insert("subscriptionPlans", plan);
        plansCreated++;
      }
    }

    // Create credit packages
    const creditPackages = [
      {
        packageId: "credits_500",
        name: "500 Credits",
        description: "Perfect for small projects",
        stripePriceId: "prod_Sn4JK3NSxuRuVv", // Replace with actual Stripe price ID
        credits: 500,
        price: 1500, // $15.00
        currency: "usd",
        isActive: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        packageId: "credits_1000",
        name: "1,000 Credits",
        description: "Great value for medium projects",
        stripePriceId: "prod_Sn4LW9VLfrLMlI",
        credits: 1000,
        price: 2500, // $25.00 (better rate)
        currency: "usd",
        isActive: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        packageId: "credits_2500",
        name: "2,500 Credits",
        description: "Best value for large projects",
        stripePriceId: "prod_Sn4MM24PqgsVue",
        credits: 2500,
        price: 5000, // $50.00 (best rate)
        currency: "usd",
        isActive: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        packageId: "credits_5000",
        name: "5,000 Credits",
        description: "Enterprise-level credit package",
        stripePriceId: "prod_Sn4MvMpZ0eZAt0",
        credits: 5000,
        price: 9000, // $90.00 (enterprise rate)
        currency: "usd",
        isActive: true,
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Upsert credit packages
    for (const creditPackage of creditPackages) {
      const existingPackage = await ctx.db
        .query("creditPackages")
        .withIndex("by_package_id", (q) => q.eq("packageId", creditPackage.packageId))
        .first();

      if (existingPackage) {
        // Update existing package
        await ctx.db.patch(existingPackage._id, {
          ...creditPackage,
          updatedAt: now,
        });
        packagesUpdated++;
      } else {
        // Create new package
        await ctx.db.insert("creditPackages", creditPackage);
        packagesCreated++;
      }
    }

    return { 
      message: "Subscription data seeded successfully",
      plansCreated,
      plansUpdated,
      packagesCreated,
      packagesUpdated,
      totalPlans: plans.length,
      totalPackages: creditPackages.length,
    };
  },
});