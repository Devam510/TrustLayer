import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const emailSequences = pgTable(
  'email_sequences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    sequenceType: varchar('sequence_type').notNull(),
    step: integer('step').notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
    openedAt: timestamp('opened_at', { withTimezone: true }),
  },
  (table) => [
    // UNIQUE constraint: one record per user per sequence step
    unique('uq_email_sequences_user_seq_step').on(
      table.userId,
      table.sequenceType,
      table.step,
    ),
  ],
)

export type EmailSequence = typeof emailSequences.$inferSelect
export type NewEmailSequence = typeof emailSequences.$inferInsert
