import {
  pgTable,
  varchar,
  integer,
  boolean,
} from 'drizzle-orm/pg-core'

export const planLimits = pgTable('plan_limits', {
  plan: varchar('plan').primaryKey(),
  maxProjects: integer('max_projects'),       // NULL = unlimited
  maxClients: integer('max_clients'),          // NULL = unlimited
  checkIntervalMin: integer('check_interval_min').notNull(),
  emailAlerts: boolean('email_alerts').notNull(),
  webhookAlerts: boolean('webhook_alerts').notNull(),
  apiAccess: boolean('api_access').notNull(),
})

export type PlanLimit = typeof planLimits.$inferSelect
export type NewPlanLimit = typeof planLimits.$inferInsert
