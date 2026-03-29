"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.organizations = (0, pg_core_1.pgTable)('organizations', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name').notNull(),
    ownerId: (0, pg_core_1.uuid)('owner_id').references(() => users_1.users.id),
    slug: (0, pg_core_1.varchar)('slug').unique(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
});
//# sourceMappingURL=organizations.js.map