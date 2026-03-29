"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planLimits = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.planLimits = (0, pg_core_1.pgTable)('plan_limits', {
    plan: (0, pg_core_1.varchar)('plan').primaryKey(),
    maxProjects: (0, pg_core_1.integer)('max_projects'), // NULL = unlimited
    maxClients: (0, pg_core_1.integer)('max_clients'), // NULL = unlimited
    checkIntervalMin: (0, pg_core_1.integer)('check_interval_min').notNull(),
    emailAlerts: (0, pg_core_1.boolean)('email_alerts').notNull(),
    webhookAlerts: (0, pg_core_1.boolean)('webhook_alerts').notNull(),
    apiAccess: (0, pg_core_1.boolean)('api_access').notNull(),
});
//# sourceMappingURL=plan-limits.js.map