import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { QUEUE_ALERT_EMAIL } from '../monitoring/queue.constants';
import { EmailService } from '../email/email.service';
import { db } from '@trustlayer/db';
import { eq } from 'drizzle-orm';
import { projects } from '@trustlayer/db';

@Injectable()
@Processor(QUEUE_ALERT_EMAIL)
export class AlertDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertDeliveryProcessor.name);

  constructor(
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<any>) {
    this.logger.log(`Processing email alert delivery for alert ID: ${job.data.alertId}`);

    const { projectId } = job.data;
    
    // Fallback log to Sentry could be managed via global interceptors or manual try-catch 
    // when throwing an error, BullMQ handles retries.

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      this.logger.error(`Project ${projectId} not found for alert delivery.`);
      throw new Error(`Project ${projectId} not found`);
    }

    // In a real scenario, look up the email of the subscriber or freelancer
    const mockTo = 'freelancer@example.com';

    await this.emailService.sendTrustAlert(mockTo, project.title, 'Acme Corp', 0, 0);

    return { delivered: true };
  }
}
