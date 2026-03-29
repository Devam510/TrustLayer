"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookDeliveries = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const alerts_1 = require("./alerts");
exports.webhookDeliveries = (0, pg_core_1.pgTable)('webhook_deliveries', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    alertId: (0, pg_core_1.uuid)('alert_id').references(() => alerts_1.alerts.id, { onDelete: 'cascade' }),
    url: (0, pg_core_1.varchar)('url').notNull(),
    payload: (0, pg_core_1.jsonb)('payload'),
    statusCode: (0, pg_core_1.integer)('status_code'),
    response: (0, pg_core_1.text)('response'),
    delivered: (0, pg_core_1.boolean)('delivered').default(false).notNull(),
    attempt: (0, pg_core_1.integer)('attempt').default(1).notNull(),
    attemptedAt: (0, pg_core_1.timestamp)('attempted_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=webhook-deliveries.js.map