import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { projects } from './projects'
import { users } from './users'

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  type: varchar('type')
    .notNull()
    .$type<'low_balance' | 'stop_work' | 'reauth_required' | 'balance_restored'>(),
  message: text('message'),
  severity: varchar('severity').notNull().$type<'info' | 'warning' | 'critical'>(),
  emailSent: boolean('email_sent').default(false).notNull(),
  acknowledged: boolean('acknowledged').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Alert = typeof alerts.$inferSelect
export type NewAlert = typeof alerts.$inferInsert
