import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  integer,
  boolean,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { alerts } from './alerts'

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id').references(() => alerts.id, { onDelete: 'cascade' }),
  url: varchar('url').notNull(),
  payload: jsonb('payload'),
  statusCode: integer('status_code'),
  response: text('response'),
  delivered: boolean('delivered').default(false).notNull(),
  attempt: integer('attempt').default(1).notNull(),
  attemptedAt: timestamp('attempted_at', { withTimezone: true }).defaultNow().notNull(),
})

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert
