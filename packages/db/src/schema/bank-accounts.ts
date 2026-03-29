import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  customType,
} from 'drizzle-orm/pg-core'
import { organizations } from './organizations'
import { users } from './users'

// BYTEA custom type for encrypted access token
const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const bankAccounts = pgTable('bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organizations.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  countryCode: varchar('country_code', { length: 2 }).default('US').notNull(),
  bankingProvider: varchar('banking_provider')
    .default('plaid')
    .notNull()
    .$type<'plaid' | 'truelayer' | 'basiq'>(),
  providerItemId: varchar('provider_item_id').notNull(),
  accessToken: bytea('access_token').notNull(), // AES-256-GCM encrypted
  keyVersion: integer('key_version').default(1).notNull(), // Key rotation tracking
  institutionName: varchar('institution_name'),
  accountMask: varchar('account_mask', { length: 4 }),
  status: varchar('status')
    .default('active')
    .notNull()
    .$type<'active' | 'needs_reauth' | 'revoked'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type BankAccount = typeof bankAccounts.$inferSelect
export type NewBankAccount = typeof bankAccounts.$inferInsert
