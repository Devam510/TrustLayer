import { Injectable, Inject, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import Razorpay from 'razorpay'
import * as crypto from 'crypto'
import { RAZORPAY_TOKEN } from './razorpay.provider'
import { DATABASE_TOKEN } from '../database/database.module'
import { subscriptions } from '@trustlayer/db'
import { MetricsService } from '../metrics/metrics.service'

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(RAZORPAY_TOKEN) private readonly razorpay: Razorpay,
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * Create a Razorpay Customer for an org.
   * Called AFTER atomic registration TX commits.
   */
  async createCustomer(orgId: string, email: string, name: string): Promise<string> {
    const customer = await (this.razorpay.customers as any).create({ email, name })
    await this.db
      .update(subscriptions)
      .set({ razorpayCustomerId: customer.id })
      .where(eq(subscriptions.orgId, orgId))
    return customer.id
  }

  /**
   * Create a Razorpay Subscription for an org.
   * Returns { subscriptionId, shortUrl } — client opens shortUrl to pay.
   */
  async createSubscription(orgId: string, planId: string) {
    if (process.env.NODE_ENV === 'development') {
      return { subscriptionId: 'sub_mock', shortUrl: null, mock: true }
    }

    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.orgId, orgId),
    })
    if (!sub?.razorpayCustomerId) throw new BadRequestException('No Razorpay customer found')

    const rzpSub = await (this.razorpay.subscriptions as any).create({
      plan_id: planId,
      total_count: 12, // 12 billing cycles (1 year)
      quantity: 1,
      customer_notify: 1,
      customer_id: sub.razorpayCustomerId,
    })

    await this.db
      .update(subscriptions)
      .set({ razorpaySubId: rzpSub.id, status: 'trialing' })
      .where(eq(subscriptions.orgId, orgId))

    return { subscriptionId: rzpSub.id, shortUrl: rzpSub.short_url }
  }

  async cancelSubscription(orgId: string) {
    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.orgId, orgId),
    })
    if (!sub?.razorpaySubId) return

    await (this.razorpay.subscriptions as any).cancel(sub.razorpaySubId, true) // cancel_at_period_end=true
    await this.db
      .update(subscriptions)
      .set({ status: 'canceled' })
      .where(eq(subscriptions.orgId, orgId))
  }

  /**
   * Handle Razorpay subscription webhook events.
   * Verifies signature then dispatches to handlers.
   */
  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    const secret = this.config.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET')

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')
    const isValid = expectedSignature === signature

    if (!isValid) {
      this.metrics.stripeWebhookFailures.inc() // reuse existing counter
      throw new BadRequestException('Razorpay webhook signature verification failed')
    }

    const event = JSON.parse(rawBody)
    switch (event.event) {
      case 'subscription.charged':
        await this.handleSubCharged(event.payload.subscription.entity, event.payload.payment?.entity)
        break
      case 'subscription.cancelled':
      case 'subscription.completed':
        await this.handleSubCancelled(event.payload.subscription.entity)
        break
      case 'subscription.halted':
        await this.handleSubHalted(event.payload.subscription.entity)
        break
    }
  }

  private async handleSubCharged(sub: any, payment: any) {
    await this.db
      .update(subscriptions)
      .set({
        plan: this.getPlanFromPlanId(sub.plan_id),
        status: 'active',
        currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : null,
      })
      .where(eq(subscriptions.razorpaySubId, sub.id))
  }

  private async handleSubCancelled(sub: any) {
    await this.db
      .update(subscriptions)
      .set({ plan: 'free', status: 'canceled', razorpaySubId: null })
      .where(eq(subscriptions.razorpaySubId, sub.id))
  }

  private async handleSubHalted(sub: any) {
    await this.db
      .update(subscriptions)
      .set({ status: 'past_due' })
      .where(eq(subscriptions.razorpaySubId, sub.id))
  }

  private getPlanFromPlanId(planId: string): 'free' | 'pro' | 'agency' {
    if (planId === this.config.get('RAZORPAY_PLAN_PRO')) return 'pro'
    if (planId === this.config.get('RAZORPAY_PLAN_AGENCY')) return 'agency'
    return 'free'
  }
}
