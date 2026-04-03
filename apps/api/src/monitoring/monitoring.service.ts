import { Injectable, Inject, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { eq, sql } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { projects, alerts, escrowTransactions } from '@trustlayer/db'
import { MetricsService } from '../metrics/metrics.service'
import type { EscrowCheckJobData } from './queue.constants'
import { fromEvent, Observable } from 'rxjs'

export interface TrustStatusEvent {
  projectId: string
  status: 'safe' | 'at_risk' | 'stopped'
  totalBudget: number
  totalEscrowed: number      // actually deposited (held)
  totalReleased: number      // already paid out
  fundedMilestones: number   // count of funded milestones
  totalMilestones: number
  currency: string
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
   * Process an escrow check job.
   * Compares escrow balance against project milestones and emits SSE event.
   */
  async processEscrowCheck(data: EscrowCheckJobData): Promise<void> {
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
    })
    
    if (!project) return

    const milestones = (project.milestones as any[]) || []
    const totalMilestones = milestones.length
    
    // Query escrow sums
    const { rows } = await this.db.execute(
      sql`SELECT status, COALESCE(SUM(amount), 0) as total FROM escrow_transactions WHERE project_id = ${data.projectId} GROUP BY status`,
    )
    
    let totalEscrowed = 0
    let totalReleased = 0
    
    for (const row of rows as any[]) {
      if (row.status === 'held') totalEscrowed = Number(row.total)
      if (row.status === 'released') totalReleased = Number(row.total)
    }

    // Determine how many milestones are fully funded (or released)
    const fundedMilestones = milestones.filter(m => m.status === 'funded' || m.status === 'released').length

    // Determine status (safe all funded, at_risk if not fully funded, stopped if 0 and project active)
    let isSufficient = true
    let status: 'safe' | 'at_risk' | 'stopped' = 'safe'
    
    const requiredEscrow = milestones.filter(m => m.status !== 'released').reduce((acc, m) => acc + Number(m.amount), 0)
    
    if (totalEscrowed < requiredEscrow) {
       isSufficient = false
       status = totalEscrowed === 0 ? 'stopped' : 'at_risk'
    }

    // Update project status if changed
    const dbStatus = isSufficient ? 'active' : 'at_risk'
    if (project.status !== dbStatus) {
      await this.db
        .update(projects)
        .set({ status: dbStatus, updatedAt: new Date() })
        .where(eq(projects.id, data.projectId))
    }

    // Emit metrics
    this.metrics.balanceChecksTotal.inc({
      status: isSufficient ? 'sufficient' : 'insufficient',
      plan: data.plan,
    })

    // Emit SSE event
    const event: TrustStatusEvent = {
      projectId: data.projectId,
      status,
      totalBudget: Number(project.budget),
      totalEscrowed,
      totalReleased,
      fundedMilestones,
      totalMilestones,
      currency: project.currency,
      checkedAt: new Date().toISOString(),
    }
    this.events.emit(`trust.${data.projectId}`, event)

    // If insufficient — create alert
    if (!isSufficient && project.status === 'active') {
      await this.createAlert(data)
    }
  }

  streamForProject(projectId: string): Observable<any> {
    return fromEvent(this.events, `trust.${projectId}`)
  }

  private async createAlert(data: EscrowCheckJobData): Promise<void> {
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
    })
    if (!project) return

    await this.db.insert(alerts).values({
      orgId: project.orgId,
      projectId: data.projectId,
      userId: project.freelancerId,
      type: 'low_balance',
      message: `Escrow is underfunded for project ${project.title}`,
      severity: 'warning',
    })
  }
}

