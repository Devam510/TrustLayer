"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alerts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organizations_1 = require("./organizations");
const projects_1 = require("./projects");
const users_1 = require("./users");
exports.alerts = (0, pg_core_1.pgTable)('alerts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orgId: (0, pg_core_1.uuid)('org_id')
        .notNull()
        .references(() => organizations_1.organizations.id),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => projects_1.projects.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.uuid)('user_id').references(() => users_1.users.id),
    type: (0, pg_core_1.varchar)('type')
        .notNull()
        .$type(),
    message: (0, pg_core_1.text)('message'),
    severity: (0, pg_core_1.varchar)('severity').notNull().$type(),
    emailSent: (0, pg_core_1.boolean)('email_sent').default(false).notNull(),
    acknowledged: (0, pg_core_1.boolean)('acknowledged').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=alerts.js.map