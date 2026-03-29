import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id),
  stripeCustomerId: varchar('stripe_customer_id').unique(),
  stripeSubId: varchar('stripe_sub_id').unique(),
  plan: varchar('plan').default('free').notNull(),
  status: varchar('status')
    .notNull()
    .$type<'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired'>(),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
})

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
