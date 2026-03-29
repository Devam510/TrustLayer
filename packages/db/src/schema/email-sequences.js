"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailSequences = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.emailSequences = (0, pg_core_1.pgTable)('email_sequences', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => users_1.users.id),
    sequenceType: (0, pg_core_1.varchar)('sequence_type').notNull(),
    step: (0, pg_core_1.integer)('step').notNull(),
    sentAt: (0, pg_core_1.timestamp)('sent_at', { withTimezone: true }).defaultNow().notNull(),
    openedAt: (0, pg_core_1.timestamp)('opened_at', { withTimezone: true }),
}, (table) => [
    // UNIQUE constraint: one record per user per sequence step
    (0, pg_core_1.unique)('uq_email_sequences_user_seq_step').on(table.userId, table.sequenceType, table.step),
]);
//# sourceMappingURL=email-sequences.js.map