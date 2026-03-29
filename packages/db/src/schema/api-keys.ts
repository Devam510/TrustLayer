import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { users } from './users'

// SHA-256 hash stored for fast timingSafeEqual comparison (NOT bcrypt)
// key_prefix format: tl_live_{first 8 chars of rawKey}
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name'),
  keyHash: varchar('key_hash').notNull(), // SHA-256 hash for fast resolution
  keyPrefix: varchar('key_prefix').notNull(), // tl_live_{first 8 chars}
  scopes: text('scopes').array(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type ApiKey = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
