// Queue names as constants — used by producers and consumers
export const QUEUE_ESCROW_CHECK_CRITICAL = 'escrow-check:critical'
export const QUEUE_ESCROW_CHECK_STANDARD = 'escrow-check:standard'
export const QUEUE_ESCROW_CHECK_FREE = 'escrow-check:free'
export const QUEUE_ALERT_EMAIL = 'alert-delivery:email'
export const QUEUE_ALERT_WEBHOOK = 'alert-delivery:webhook'
export const QUEUE_AUDIT_ARCHIVAL = 'audit-archival'

// DLQ names
export const DLQ_ESCROW_CHECK = 'dlq:escrow-check'
export const DLQ_ALERT_DELIVERY = 'dlq:alert-delivery'
export const DLQ_AUDIT_ARCHIVAL = 'dlq:audit-archival'

// Base job options — applied to all queues
export const BASE_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 500,
}

// Balance check intervals by tier (in milliseconds)
export const CHECK_INTERVAL_MS = {
  agency: 1 * 60 * 1000,   // 1 min
  pro: 5 * 60 * 1000,       // 5 min
  free: 30 * 60 * 1000,     // 30 min
}

// Job payloads
export interface EscrowCheckJobData {
  projectId: string
  plan: string
}

export interface AlertDeliveryJobData {
  alertId: string
  channel: 'email' | 'webhook'
  userId?: string
  webhookUrl?: string
  webhookSecret?: string
}


