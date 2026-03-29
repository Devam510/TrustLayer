import { Injectable, OnModuleInit } from '@nestjs/common'
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry()

  // trustlayer_balance_checks_total — Counter, labels: { status, plan }
  readonly balanceChecksTotal = new Counter({
    name: 'trustlayer_balance_checks_total',
    help: 'Total number of balance checks performed',
    labelNames: ['status', 'plan'] as const,
    registers: [this.registry],
  })

  // trustlayer_plaid_api_errors_total — Counter, labels: { error_code }
  readonly plaidApiErrorsTotal = new Counter({
    name: 'trustlayer_plaid_api_errors_total',
    help: 'Total number of Plaid API errors',
    labelNames: ['error_code'] as const,
    registers: [this.registry],
  })

  // trustlayer_alert_delivery_latency_ms — Histogram, labels: { channel }
  readonly alertDeliveryLatency = new Histogram({
    name: 'trustlayer_alert_delivery_latency_ms',
    help: 'Alert delivery latency in milliseconds',
    labelNames: ['channel'] as const,
    buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
    registers: [this.registry],
  })

  // trustlayer_queue_depth — Gauge, labels: { queue_name }
  readonly queueDepth = new Gauge({
    name: 'trustlayer_queue_depth',
    help: 'Current depth of BullMQ queues',
    labelNames: ['queue_name'] as const,
    registers: [this.registry],
  })

  // trustlayer_active_plaid_connections — Gauge, labels: { status }
  readonly activePlaidConnections = new Gauge({
    name: 'trustlayer_active_plaid_connections',
    help: 'Number of Plaid bank account connections by status',
    labelNames: ['status'] as const,
    registers: [this.registry],
  })

  // trustlayer_stripe_webhook_failures — Counter
  readonly stripeWebhookFailures = new Counter({
    name: 'trustlayer_stripe_webhook_failures',
    help: 'Total number of Stripe webhook processing failures',
    registers: [this.registry],
  })

  onModuleInit() {
    // Collect default Node.js metrics (heap, CPU, etc.)
    collectDefaultMetrics({ register: this.registry })
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics()
  }
}
