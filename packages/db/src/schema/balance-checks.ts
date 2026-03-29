import {
  pgTable,
  uuid,
  decimal,
  boolean,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { bankAccounts } from './bank-accounts'

// NOTE: balance_checks is partitioned by RANGE (checked_at).
// The Drizzle schema defines the parent table structure only.
// partition setup is done in the db:seed / init script via pg_partman
// PK must include partition key (checked_at) to satisfy pg constraint.
export const balanceChecks = pgTable(
  'balance_checks',
  {
    id: uuid('id').defaultRandom().notNull(),
    checkedAt: timestamp('checked_at', { withTimezone: true }).defaultNow().notNull(),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    bankAccountId: uuid('bank_account_id').references(() => bankAccounts.id),
    balance: decimal('balance', { precision: 12, scale: 2 }),
    budget: decimal('budget', { precision: 12, scale: 2 }),
    bufferThreshold: decimal('buffer_threshold', { precision: 12, scale: 2 }),
    isSufficient: boolean('is_sufficient'),
  },
  (table) => [primaryKey({ columns: [table.id, table.checkedAt] })],
)

export type BalanceCheck = typeof balanceChecks.$inferSelect
export type NewBalanceCheck = typeof balanceChecks.$inferInsert
