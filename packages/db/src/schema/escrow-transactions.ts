import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './users'

export const escrowTransactions = pgTable('escrow_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  milestoneIndex: integer('milestone_index').notNull(),
  type: varchar('type')
    .notNull()
    .$type<'fund' | 'release' | 'refund'>(),

  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('INR').notNull(),
  platformFee: decimal('platform_fee', { precision: 12, scale: 2 }),

  // Razorpay identifiers
  razorpayOrderId: varchar('razorpay_order_id'),    // Order created for client payment
  razorpayPaymentId: varchar('razorpay_payment_id'), // Payment captured
  razorpayTransferId: varchar('razorpay_transfer_id'), // Route transfer to freelancer

  // Parties
  fromUserId: uuid('from_user_id').references(() => users.id), // client
  toUserId: uuid('to_user_id').references(() => users.id),     // freelancer

  status: varchar('status')
    .notNull()
    .default('pending')
    .$type<'pending' | 'captured' | 'held' | 'released' | 'refunded' | 'failed'>(),

  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export type EscrowTransaction = typeof escrowTransactions.$inferSelect
export type NewEscrowTransaction = typeof escrowTransactions.$inferInsert
