import { Injectable, Inject, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { eq } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { projects, balanceChecks, alerts } from '@trustlayer/db'
import { MetricsService } from '../metrics/metrics.service'
import type { BalanceCheckJobData } from './queue.constants'
import { fromEvent, Observable } from 'rxjs'

export interface TrustStatusEvent {
  projectId: string
  status: 'safe' | 'at_risk' | 'stopped'
  balance: number
  budget: number
  confidence: 'high' | 'medium' | 'low'
  fundStability: 'stable' | 'moderate' | 'volatile' | 'insufficient_data'
  checkedAt: string
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name)

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly events: EventEmitter2,
    private readonly metrics: MetricsService,
  ) {}

  /**
   * Process a balance check job.
   * Writes balance_checks record, updates project status, and emits SSE event.
   */
  async processBalanceCheck(data: BalanceCheckJobData, currentBalance: number): Promise<void> {
    const threshold = (data.budget * data.bufferPct) / 100
    const isSufficient = currentBalance >= threshold

    // Write balance_checks record
    await this.db.insert(balanceChecks).values({
      projectId: data.projectId,
      bankAccountId: data.bankAccountId,
      balance: String(currentBalance),
      budget: String(data.budget),
      bufferThreshold: String(threshold),
      isSufficient,
    })

    // Update project status
    const status = isSufficient ? 'active' : 'at_risk'
    await this.db
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.id, data.projectId))

    // Increment metrics
    this.metrics.balanceChecksTotal.inc({
      status: isSufficient ? 'sufficient' : 'insufficient',
      plan: data.plan,
    })

    // Calculate confidence and fund stability
    const recentChecks = await this.getRecentChecks(data.projectId, 10)
    const confidence = await this.calculateConfidence(data.bankAccountId, recentChecks)
    const fundStability = this.calculateFundStability(recentChecks)

    // Emit SSE event
    const event: TrustStatusEvent = {
      projectId: data.projectId,
      status: isSufficient ? 'safe' : 'at_risk',
      balance: currentBalance,
      budget: data.budget,
      confidence,
      fundStability,
      checkedAt: new Date().toISOString(),
    }
    this.events.emit(`trust.${data.projectId}`, event)

    // If insufficient — create alert
    if (!isSufficient) {
      await this.createAlert(data)
    }
  }

  streamForProject(projectId: string): Observable<any> {
    return fromEvent(this.events, `trust.${projectId}`)
  }

  private async getRecentChecks(projectId: string, limit: number) {
    return this.db.query.balanceChecks.findMany({
      where: eq(balanceChecks.projectId, projectId),
      orderBy: (b: any, { desc }: any) => [desc(b.checkedAt)],
      limit,
    })
  }

  /**
   * Confidence = (time_score * 0.50) + (consecutive_checks * 0.30) + (connection_health * 0.20)
   */
  private async calculateConfidence(
    bankAccountId: string,
    recentChecks: any[],
  ): Promise<'high' | 'medium' | 'low'> {
    const count = recentChecks.length
    const lastCheck = recentChecks[0]

    // time_since_last_check_score
    let timeScore = 0.1
    if (lastCheck) {
      const minutesAgo = (Date.now() - new Date(lastCheck.checkedAt).getTime()) / 60000
      if (minutesAgo < 6) timeScore = 1.0
      else if (minutesAgo < 15) timeScore = 0.7
      else if (minutesAgo < 30) timeScore = 0.4
    }

    // consecutive_checks score
    let checkScore = 0.1
    if (count >= 10) checkScore = 1.0
    else if (count >= 5) checkScore = 0.7
    else if (count >= 2) checkScore = 0.4

    // connection_health score
    const accountStatus = await this.db.query.bankAccounts?.findFirst({
      where: (b: any, { eq: eqFn }: any) => eqFn(b.id, bankAccountId),
    })
    const connectionScore =
      accountStatus?.status === 'active'
        ? 1.0
        : accountStatus?.status === 'needs_reauth'
          ? 0.2
          : 0.0

    const score = timeScore * 0.5 + checkScore * 0.3 + connectionScore * 0.2

    if (score >= 0.75) return 'high'
    if (score >= 0.45) return 'medium'
    return 'low'
  }

  /**
   * Fund stability requires minimum 5 checks.
   * Compares balance trend across recent checks.
   */
  private calculateFundStability(
    checks: { balance: string; isSufficient: boolean }[],
  ): 'stable' | 'moderate' | 'volatile' | 'insufficient_data' {
    if (checks.length < 5) return 'insufficient_data'

    const balances = checks.map((c) => parseFloat(c.balance ?? '0'))
    const max = Math.max(...balances)
    const min = Math.min(...balances)
    const avg = balances.reduce((a, b) => a + b, 0) / balances.length
    const variance = (max - min) / avg

    if (variance < 0.05) return 'stable'
    if (variance < 0.2) return 'moderate'
    return 'volatile'
  }

  private async createAlert(data: BalanceCheckJobData): Promise<void> {
    // Get project's org and freelancer_id for alert creation
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
    })
    if (!project) return

    await this.db.insert(alerts).values({
      orgId: project.orgId,
      projectId: data.projectId,
      userId: project.freelancerId,
      type: 'low_balance',
      message: `Balance below threshold for project ${project.title}`,
      severity: 'warning',
    })
  }
}
