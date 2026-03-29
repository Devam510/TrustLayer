import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  inet,
  timestamp,
} from 'drizzle-orm/pg-core'
import { users } from './users'

// audit_logs are IMMUTABLE — enforced by DB trigger (prevent_audit_modification)
// Never update or delete records from this table.
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id),
  action: varchar('action').notNull(),
  entityType: varchar('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  metadata: jsonb('metadata'),
  ipAddress: inet('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
