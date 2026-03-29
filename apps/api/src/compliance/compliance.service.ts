import { Injectable, Inject, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { lt, sql } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import {
  balanceChecks,
  alerts,
  auditLogs,
  emailSequences,
  users,
} from '@trustlayer/db'

/**
 * RETENTION_RULES as constants — avoids systemic silent failures from DB config.
 * Nightly BullMQ job enforces these retention windows.
 */
const RETENTION_RULES = {
  balance_checks: { days: 90, anonymize: false },
  alerts: { days: 365, anonymize: false },
  audit_logs: { days: 2555, anonymize: false }, // ~7 years
  email_sequences: { days: 180, anonymize: false },
} as const

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name)

  constructor(@Inject(DATABASE_TOKEN) private readonly db: any) {}

  /**
   * Nightly retention cleanup — runs at 2am UTC.
   * Deletes records older than RETENTION_RULES thresholds.
   * audit_logs are NOT deleted (immutable). Only balance_checks, alerts, email_sequences.
   */
  @Cron('0 2 * * *')
  async runRetentionJob() {
    this.logger.log('[compliance] Starting nightly retention cleanup')

    const results: Record<string, number> = {}

    // balance_checks: 90 days
    const bcCutoff = new Date(Date.now() - RETENTION_RULES.balance_checks.days * 86400000)
    const bcResult = await this.db
      .delete(balanceChecks)
      .where(lt(balanceChecks.checkedAt, bcCutoff))
    results['balance_checks'] = bcResult.count ?? 0

    // alerts: 365 days
    const alertCutoff = new Date(Date.now() - RETENTION_RULES.alerts.days * 86400000)
    const alertResult = await this.db
      .delete(alerts)
      .where(lt(alerts.createdAt, alertCutoff))
    results['alerts'] = alertResult.count ?? 0

    // email_sequences: 180 days
    const esCutoff = new Date(Date.now() - RETENTION_RULES.email_sequences.days * 86400000)
    const esResult = await this.db
      .delete(emailSequences)
      .where(lt(emailSequences.sentAt, esCutoff))
    results['email_sequences'] = esResult.count ?? 0

    // audit_logs: immutable — only log, never delete
    this.logger.log(
      `[compliance] Retention completed: ${JSON.stringify(results)}`,
    )
  }

  /**
   * CCPA/GDPR: Anonymize user PII.
   * Sets anonymized=true, scrubs email, name, slug.
   */
  async anonymizeUser(userId: string) {
    const anonymizedEmail = `anon-${userId.slice(0, 8)}@deleted.trustlayer.dev`
    await this.db
      .update(users)
      .set({
        email: anonymizedEmail,
        name: '[Deleted User]',
        slug: null,
        emailVerificationToken: null,
        anonymized: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(sql`id = ${userId}`)
    return { anonymized: true }
  }
}
