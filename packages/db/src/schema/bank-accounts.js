"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankAccounts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organizations_1 = require("./organizations");
const users_1 = require("./users");
// BYTEA custom type for encrypted access token
const bytea = (0, pg_core_1.customType)({
    dataType() {
        return 'bytea';
    },
});
exports.bankAccounts = (0, pg_core_1.pgTable)('bank_accounts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orgId: (0, pg_core_1.uuid)('org_id')
        .notNull()
        .references(() => organizations_1.organizations.id),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => users_1.users.id),
    countryCode: (0, pg_core_1.varchar)('country_code', { length: 2 }).default('US').notNull(),
    bankingProvider: (0, pg_core_1.varchar)('banking_provider')
        .default('plaid')
        .notNull()
        .$type(),
    providerItemId: (0, pg_core_1.varchar)('provider_item_id').notNull(),
    accessToken: bytea('access_token').notNull(), // AES-256-GCM encrypted
    keyVersion: (0, pg_core_1.integer)('key_version').default(1).notNull(), // Key rotation tracking
    institutionName: (0, pg_core_1.varchar)('institution_name'),
    accountMask: (0, pg_core_1.varchar)('account_mask', { length: 4 }),
    status: (0, pg_core_1.varchar)('status')
        .default('active')
        .notNull()
        .$type(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=bank-accounts.js.map