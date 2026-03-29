import { Injectable, BadRequestException, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { subscriptions } from '@trustlayer/db'
import { MetricsService } from '../metrics/metrics.service'

@Injectable()
export class BillingService {
  private readonly stripe: Stripe

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-02-24.acacia',
    })
  }

  /**
   * Create a Stripe customer for an org.
   * Called AFTER atomic registration TX commits (never inside TX to avoid locking).
   */
  async createStripeCustomer(orgId: string, email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { orgId },
    })

    await this.db
      .update(subscriptions)
      .set({ stripeCustomerId: customer.id })
      .where(eq(subscriptions.orgId, orgId))

    return customer.id
  }

  async createCheckoutSession(orgId: string, priceId: string, returnUrl: string) {
    if (process.env.NODE_ENV === 'development') {
      return { url: `${returnUrl}?checkout=success&mock=true` }
    }

    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.orgId, orgId),
    })
    if (!sub?.stripeCustomerId) throw new BadRequestException('No Stripe customer found')

    const session = await this.stripe.checkout.sessions.create({
      customer: sub.stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?checkout=success`,
      cancel_url: `${returnUrl}?checkout=canceled`,
      metadata: { orgId },
    })

    return { url: session.url }
  }

  async createPortalSession(orgId: string, returnUrl: string) {
    if (process.env.NODE_ENV === 'development') {
      return { url: `${returnUrl}?portal=mock_dashboard` }
    }

    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.orgId, orgId),
    })
    if (!sub?.stripeCustomerId) throw new BadRequestException('No Stripe customer found')

    const session = await this.stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  }

  /**
   * Process validated Stripe webhook events.
   * Handle: checkout.session.completed, customer.subscription.updated,
   *         customer.subscription.deleted, invoice.payment_failed
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')
    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      this.metrics.stripeWebhookFailures.inc()
      throw new BadRequestException(`Stripe webhook signature verification failed: ${err}`)
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break
        default:
          // Ignore unhandled events
          break
      }
    } catch (err) {
      this.metrics.stripeWebhookFailures.inc()
      throw err
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!session.subscription || !session.metadata?.orgId) return
    const stripeSub = await this.stripe.subscriptions.retrieve(session.subscription as string)

    await this.db
      .update(subscriptions)
      .set({
        stripeSubId: stripeSub.id,
        plan: this.getPlanFromPriceId(stripeSub.items.data[0]?.price.id ?? ''),
        status: stripeSub.status as any,
        currentPeriodEnd: new Date((stripeSub.current_period_end ?? 0) * 1000),
      })
      .where(eq(subscriptions.orgId, session.metadata.orgId))
  }

  private async handleSubscriptionUpdated(stripeSub: Stripe.Subscription) {
    const customer = await this.stripe.customers.retrieve(stripeSub.customer as string)
    if (customer.deleted) return
    const orgId = (customer as Stripe.Customer).metadata.orgId
    if (!orgId) return

    await this.db
      .update(subscriptions)
      .set({
        plan: this.getPlanFromPriceId(stripeSub.items.data[0]?.price.id ?? ''),
        status: stripeSub.status as any,
        currentPeriodEnd: new Date((stripeSub.current_period_end ?? 0) * 1000),
        trialEndsAt: stripeSub.trial_end
          ? new Date(stripeSub.trial_end * 1000)
          : null,
      })
      .where(eq(subscriptions.orgId, orgId))
  }

  private async handleSubscriptionDeleted(stripeSub: Stripe.Subscription) {
    const customer = await this.stripe.customers.retrieve(stripeSub.customer as string)
    if (customer.deleted) return
    const orgId = (customer as Stripe.Customer).metadata.orgId
    if (!orgId) return

    await this.db
      .update(subscriptions)
      .set({ plan: 'free', status: 'canceled', stripeSubId: null })
      .where(eq(subscriptions.orgId, orgId))
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string
    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeCustomerId, customerId),
    })
    if (!sub) return

    await this.db
      .update(subscriptions)
      .set({ status: 'past_due' })
      .where(eq(subscriptions.orgId, sub.orgId))
  }

  private getPlanFromPriceId(priceId: string): string {
    if (priceId === this.config.get('STRIPE_PRICE_PRO')) return 'pro'
    if (priceId === this.config.get('STRIPE_PRICE_AGENCY')) return 'agency'
    return 'free'
  }
}
