"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationPreferences = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.notificationPreferences = (0, pg_core_1.pgTable)('notification_preferences', {
    userId: (0, pg_core_1.uuid)('user_id')
        .primaryKey()
        .references(() => users_1.users.id),
    emailAlerts: (0, pg_core_1.boolean)('email_alerts').default(true).notNull(),
    emailDigest: (0, pg_core_1.varchar)('email_digest')
        .default('none')
        .notNull()
        .$type(),
    webhookUrl: (0, pg_core_1.varchar)('webhook_url'),
    webhookSecret: (0, pg_core_1.varchar)('webhook_secret'),
    slackWebhook: (0, pg_core_1.varchar)('slack_webhook'),
    quietHoursStart: (0, pg_core_1.time)('quiet_hours_start'),
    quietHoursEnd: (0, pg_core_1.time)('quiet_hours_end'),
    timezone: (0, pg_core_1.varchar)('timezone').default('UTC').notNull(),
});
//# sourceMappingURL=notification-preferences.js.map