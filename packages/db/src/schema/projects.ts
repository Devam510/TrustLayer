import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  jsonb,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { users } from './users'
import { bankAccounts } from './bank-accounts'

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id),
  clientId: uuid('client_id').references(() => users.id),
  freelancerId: uuid('freelancer_id').references(() => users.id),
  title: varchar('title').notNull(),
  description: text('description'),
  budget: decimal('budget', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  countryCode: varchar('country_code', { length: 2 }).default('US').notNull(),
  bankAccountId: uuid('bank_account_id').references(() => bankAccounts.id),
  status: varchar('status')
    .default('draft')
    .notNull()
    .$type<'draft' | 'pending_verification' | 'active' | 'at_risk' | 'stopped' | 'completed'>(),
  bufferPct: decimal('buffer_pct', { precision: 5, scale: 2 }).default('10.00').notNull(),
  milestones: jsonb('milestones').default([]).notNull(),
  inviteToken: varchar('invite_token').unique(),
  inviteTokenExpiresAt: timestamp('invite_token_expires_at', { withTimezone: true }),
  inviteTokenUsed: boolean('invite_token_used').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
