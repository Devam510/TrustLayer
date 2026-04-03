import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email').notNull().unique(),
  name: varchar('name').notNull(),
  slug: varchar('slug').unique(),
  passwordHash: varchar('password_hash').notNull(),
  productRole: varchar('product_role')
    .default('freelancer')
    .notNull()
    .$type<'freelancer' | 'client'>(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: varchar('email_verification_token'),
  anonymized: boolean('anonymized').default(false).notNull(),

  // ─── Razorpay Route (Freelancer Payout Identity) ───────
  // Linked Account ID from Razorpay Route (for receiving split payments)
  razorpayLinkedAccountId: varchar('razorpay_linked_account_id').unique(),
  // Bank verification status — payouts blocked until true
  bankAccountVerified: boolean('bank_account_verified').default(false).notNull(),
  // Masked account number for display (last 4 digits)
  bankAccountMask: varchar('bank_account_mask', { length: 4 }),
  // IFSC code for display
  bankIfsc: varchar('bank_ifsc', { length: 11 }),
  // Account holder name as verified by Razorpay
  bankAccountHolderName: varchar('bank_account_holder_name'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
