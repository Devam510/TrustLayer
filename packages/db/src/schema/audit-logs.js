"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
// audit_logs are IMMUTABLE — enforced by DB trigger (prevent_audit_modification)
// Never update or delete records from this table.
exports.auditLogs = (0, pg_core_1.pgTable)('audit_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    actorId: (0, pg_core_1.uuid)('actor_id').references(() => users_1.users.id),
    action: (0, pg_core_1.varchar)('action').notNull(),
    entityType: (0, pg_core_1.varchar)('entity_type').notNull(),
    entityId: (0, pg_core_1.uuid)('entity_id').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    ipAddress: (0, pg_core_1.inet)('ip_address'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=audit-logs.js.map