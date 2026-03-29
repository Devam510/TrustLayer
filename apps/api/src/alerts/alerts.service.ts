import { Injectable, Inject } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { createHmac } from 'crypto'
import { DATABASE_TOKEN } from '../database/database.module'
import { alerts, notificationPreferences, webhookDeliveries } from '@trustlayer/db'
import { MetricsService } from '../metrics/metrics.service'

@Injectable()
export class AlertsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly metrics: MetricsService,
  ) {}

  async listAlerts(userId: string) {
    return this.db.query.alerts.findMany({
      where: eq(alerts.userId, userId),
      orderBy: (a: any, { desc }: any) => [desc(a.createdAt)],
    })
  }

  async listRecentAlerts(orgId: string) {
    return this.db.query.alerts.findMany({
      where: eq(alerts.orgId, orgId),
      orderBy: (a: any, { desc }: any) => [desc(a.createdAt)],
      limit: 20,
    })
  }

  async acknowledge(alertId: string, userId: string) {
    await this.db
      .update(alerts)
      .set({ acknowledged: true })
      .where(and(eq(alerts.id, alertId), eq(alerts.userId, userId)))
    return { acknowledged: true }
  }

  /**
   * Returns true if alert should be sent given quiet hours and severity.
   * Critical alerts ALWAYS bypass quiet hours.
   */
  async shouldSendAlert(userId: string, isCritical: boolean): Promise<boolean> {
    const prefs = await this.db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, userId),
    })
    if (!prefs?.quietHoursStart || isCritical) return true

    const tz = prefs.timezone ?? 'UTC'
    const now = new Date().toLocaleTimeString('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })

    const [nowH, nowM] = now.split(':').map(Number)
    const nowMinutes = (nowH ?? 0) * 60 + (nowM ?? 0)

    const [startH, startM] = (prefs.quietHoursStart as string).split(':').map(Number)
    const [endH, endM] = (prefs.quietHoursEnd as string).split(':').map(Number)
    const startMinutes = (startH ?? 0) * 60 + (startM ?? 0)
    const endMinutes = (endH ?? 0) * 60 + (endM ?? 0)

    if (startMinutes <= endMinutes) {
      // Same day range e.g. 22:00–08:00 next day — inverted
      return !(nowMinutes >= startMinutes && nowMinutes < endMinutes)
    }
    return !(nowMinutes >= startMinutes || nowMinutes < endMinutes)
  }

  /**
   * Deliver alert via webhook with HMAC-SHA256 signing.
   * Stores delivery attempt in webhook_deliveries.
   */
  async deliverWebhook(
    alertId: string,
    url: string,
    secret: string,
    payload: object,
    attempt = 1,
  ): Promise<void> {
    const body = JSON.stringify(payload)
    const signature = createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    const start = Date.now()
    let statusCode = 0
    let response = ''
    let delivered = false

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TrustLayer-Signature': `sha256=${signature}`,
        },
        body,
      })
      statusCode = res.status
      response = await res.text()
      delivered = res.ok
    } catch (err) {
      response = String(err)
    }

    const latency = Date.now() - start
    this.metrics.alertDeliveryLatency.observe({ channel: 'webhook' }, latency)

    await this.db.insert(webhookDeliveries).values({
      alertId,
      url,
      payload,
      statusCode,
      response: response.slice(0, 1000),
      delivered,
      attempt,
    })

    if (!delivered) throw new Error(`Webhook delivery failed: ${statusCode} ${response}`)
  }
}
