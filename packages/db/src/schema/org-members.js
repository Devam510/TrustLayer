"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgMembers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organizations_1 = require("./organizations");
const users_1 = require("./users");
exports.orgMembers = (0, pg_core_1.pgTable)('org_members', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orgId: (0, pg_core_1.uuid)('org_id')
        .notNull()
        .references(() => organizations_1.organizations.id),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => users_1.users.id),
    role: (0, pg_core_1.varchar)('role').notNull().$type(),
    invitedBy: (0, pg_core_1.uuid)('invited_by').references(() => users_1.users.id),
    joinedAt: (0, pg_core_1.timestamp)('joined_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=org-members.js.map