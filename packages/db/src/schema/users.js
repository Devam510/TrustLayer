"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    email: (0, pg_core_1.varchar)('email').notNull().unique(),
    name: (0, pg_core_1.varchar)('name').notNull(),
    slug: (0, pg_core_1.varchar)('slug').unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash').notNull(),
    productRole: (0, pg_core_1.varchar)('product_role')
        .default('freelancer')
        .notNull()
        .$type(),
    emailVerified: (0, pg_core_1.boolean)('email_verified').default(false).notNull(),
    emailVerificationToken: (0, pg_core_1.varchar)('email_verification_token'),
    anonymized: (0, pg_core_1.boolean)('anonymized').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
});
//# sourceMappingURL=users.js.map