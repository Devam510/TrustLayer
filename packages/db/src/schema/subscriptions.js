"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organizations_1 = require("./organizations");
exports.subscriptions = (0, pg_core_1.pgTable)('subscriptions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orgId: (0, pg_core_1.uuid)('org_id')
        .notNull()
        .references(() => organizations_1.organizations.id),
    stripeCustomerId: (0, pg_core_1.varchar)('stripe_customer_id').unique(),
    stripeSubId: (0, pg_core_1.varchar)('stripe_sub_id').unique(),
    plan: (0, pg_core_1.varchar)('plan').default('free').notNull(),
    status: (0, pg_core_1.varchar)('status')
        .notNull()
        .$type(),
    trialEndsAt: (0, pg_core_1.timestamp)('trial_ends_at', { withTimezone: true }),
    currentPeriodEnd: (0, pg_core_1.timestamp)('current_period_end', { withTimezone: true }),
});
//# sourceMappingURL=subscriptions.js.map