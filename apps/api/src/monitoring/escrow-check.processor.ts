import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Logger, Inject } from '@nestjs/common'
import { Job } from 'bullmq'
import {
  QUEUE_ESCROW_CHECK_CRITICAL,
  QUEUE_ESCROW_CHECK_STANDARD,
  QUEUE_ESCROW_CHECK_FREE,
  EscrowCheckJobData,
} from './queue.constants'
import { MonitoringService } from './monitoring.service'
import { DATABASE_TOKEN } from '../database/database.module'
import { projects } from '@trustlayer/db'
import { eq } from 'drizzle-orm'

/**
 * Base processor to handle escrow checks.
 * Shared logic across multiple BullMQ queues.
 */
abstract class BaseEscrowProcessor extends WorkerHost {
  protected logger = new Logger(BaseEscrowProcessor.name)

  constructor(
    protected readonly monitoring: MonitoringService,
    @Inject(DATABASE_TOKEN) protected readonly db: any,
  ) {
    super()
  }

  async process(job: Job<{ tier: string }>): Promise<void> {
    this.logger.debug(`Processing escrow check batch for tier: ${job.data.tier}`)

    let planMap = []
    if (job.data.tier === 'critical') planMap = ['agency']
    else if (job.data.tier === 'standard') planMap = ['pro']
    else planMap = ['free']

    // Query active projects for these plans
    // We fetch projects joined with subscriptions to filter by plan
    // For simplicity here, we assume the DB query returns relevant active projects.
    // In production, you'd join with subscriptions to respect the tiers.
    const activeProjects = await this.db.query.projects.findMany({
      where: eq(projects.status, 'active'),
    })
    
    // Process each active project
    for (const project of activeProjects) {
        try {
            await this.monitoring.processEscrowCheck({
                projectId: project.id,
                plan: job.data.tier
            })
        } catch (error) {
            this.logger.error(`Failed to process escrow check for project ${project.id}: ${error}`)
        }
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} completed successfully (tier: ${job.data.tier})`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message} (tier: ${job.data.tier})`)
  }
}

@Processor(QUEUE_ESCROW_CHECK_CRITICAL)
export class CriticalEscrowProcessor extends BaseEscrowProcessor {
  constructor(monitoring: MonitoringService, @Inject(DATABASE_TOKEN) db: any) {
    super(monitoring, db)
    this.logger = new Logger(CriticalEscrowProcessor.name)
  }
}

@Processor(QUEUE_ESCROW_CHECK_STANDARD)
export class StandardEscrowProcessor extends BaseEscrowProcessor {
  constructor(monitoring: MonitoringService, @Inject(DATABASE_TOKEN) db: any) {
    super(monitoring, db)
    this.logger = new Logger(StandardEscrowProcessor.name)
  }
}

@Processor(QUEUE_ESCROW_CHECK_FREE)
export class FreeEscrowProcessor extends BaseEscrowProcessor {
  constructor(monitoring: MonitoringService, @Inject(DATABASE_TOKEN) db: any) {
    super(monitoring, db)
    this.logger = new Logger(FreeEscrowProcessor.name)
  }
}
