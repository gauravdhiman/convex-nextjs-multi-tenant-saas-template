import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";
import Stripe from "stripe";

const http = httpRouter();

auth.addHttpRoutes(http);

// Types for Stripe webhook events
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

// Stripe webhook handler
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    });
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await request.text();
    console.log('Webhook Event Body >>>> ', body);
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      console.error("Missing stripe-signature header");
      return new Response("Missing signature", { status: 400 });
    }

    let event: StripeWebhookEvent;

    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, endpointSecret) as StripeWebhookEvent;
    } catch (err) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Check if we've already processed this event
    const existingEvent = await ctx.runQuery(internal.stripe.getStripeEvent, {
      stripeEventId: event.id,
    });

    if (existingEvent && existingEvent.processed) {
      console.log(`Event ${event.id} already processed`);
      return new Response("Event already processed", { status: 200 });
    }

    // Store the event for idempotency
    if (!existingEvent) {
      await ctx.runMutation(internal.stripe.storeStripeEvent, {
        stripeEventId: event.id,
        eventType: event.type,
        data: event.data,
      });
    }

    try {
      // Handle the event
      console.log(`Processing webhook event: ${event.type} (${event.id})`);
      
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          console.log(`Handling subscription event: ${event.type}`);
          await ctx.runMutation(internal.stripe.handleSubscriptionChange, {
            stripeSubscription: event.data.object,
          });
          break;

        case "invoice.payment_succeeded":
          // Handle subscription renewal
          console.log("Handling invoice payment succeeded");
          const invoice = event.data.object;
          if (invoice.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription
              );
              await ctx.runMutation(internal.stripe.handleSubscriptionRenewal, {
                stripeSubscription: subscription,
              });
            } catch (error) {
              console.error("Error retrieving subscription for renewal:", error);
              throw error;
            }
          }
          break;

        case "checkout.session.completed":
          console.log("Handling checkout session completed");
          const session = event.data.object;
          if (session.mode === "payment" && session.metadata?.credits) {
            // Handle credit purchase
            await ctx.runMutation(internal.stripe.handleCreditPurchase, {
              checkoutSession: session,
            });
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark event as processed
      await ctx.runMutation(internal.stripe.markEventProcessed, {
        stripeEventId: event.id,
      });

      return new Response("Webhook processed successfully", { status: 200 });
    } catch (error) {
      const err = error as Error;
      console.error(`Error processing webhook: ${err.message}`);
      return new Response(`Webhook processing error: ${err.message}`, { status: 500 });
    }
  }),
});

export default http;