import {
  pgTable,
  uuid,
  varchar,
  boolean,
  time,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const notificationPreferences = pgTable('notification_preferences', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id),
  emailAlerts: boolean('email_alerts').default(true).notNull(),
  emailDigest: varchar('email_digest')
    .default('none')
    .notNull()
    .$type<'none' | 'daily' | 'weekly'>(),
  webhookUrl: varchar('webhook_url'),
  webhookSecret: varchar('webhook_secret'),
  slackWebhook: varchar('slack_webhook'),
  quietHoursStart: time('quiet_hours_start'),
  quietHoursEnd: time('quiet_hours_end'),
  timezone: varchar('timezone').default('UTC').notNull(),
})

export type NotificationPreference = typeof notificationPreferences.$inferSelect
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert
