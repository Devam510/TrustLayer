import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_ESCROW_CHECK_CRITICAL, QUEUE_ESCROW_CHECK_STANDARD, QUEUE_ESCROW_CHECK_FREE } from './queue.constants';

@Injectable()
export class MonitoringScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(MonitoringScheduler.name);

  constructor(
    @InjectQueue(QUEUE_ESCROW_CHECK_CRITICAL) private readonly criticalQueue: Queue,
    @InjectQueue(QUEUE_ESCROW_CHECK_STANDARD) private readonly standardQueue: Queue,
    @InjectQueue(QUEUE_ESCROW_CHECK_FREE) private readonly freeQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Initializing BullMQ repeating jobs for balance checks');
    await this.setupSchedules();
  }

  private async setupSchedules() {
    // CRITICAL: every 5 minutes (Agency / Enterprise plans)
    await this.criticalQueue.add(
      'schedule-critical-checks',
      { tier: 'critical' },
      {
        repeat: {
          pattern: '*/5 * * * *', // Every 5 minutes
        },
        jobId: 'system-critical-scheduler',
      },
    );

    // STANDARD: every 30 minutes (Pro plan)
    await this.standardQueue.add(
      'schedule-standard-checks',
      { tier: 'standard' },
      {
        repeat: {
          pattern: '*/30 * * * *', // Every 30 minutes
        },
        jobId: 'system-standard-scheduler',
      },
    );

    // FREE: every 6 hours (Free plan)
    await this.freeQueue.add(
      'schedule-free-checks',
      { tier: 'free' },
      {
        repeat: {
          pattern: '0 */6 * * *', // Every 6 hours
        },
        jobId: 'system-free-scheduler',
      },
    );

    this.logger.log('Schedules configured successfully.');
  }
}
