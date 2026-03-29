"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeys = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organizations_1 = require("./organizations");
const users_1 = require("./users");
// SHA-256 hash stored for fast timingSafeEqual comparison (NOT bcrypt)
// key_prefix format: tl_live_{first 8 chars of rawKey}
exports.apiKeys = (0, pg_core_1.pgTable)('api_keys', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orgId: (0, pg_core_1.uuid)('org_id')
        .notNull()
        .references(() => organizations_1.organizations.id),
    userId: (0, pg_core_1.uuid)('user_id')
        .notNull()
        .references(() => users_1.users.id),
    name: (0, pg_core_1.varchar)('name'),
    keyHash: (0, pg_core_1.varchar)('key_hash').notNull(), // SHA-256 hash for fast resolution
    keyPrefix: (0, pg_core_1.varchar)('key_prefix').notNull(), // tl_live_{first 8 chars}
    scopes: (0, pg_core_1.text)('scopes').array(),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at', { withTimezone: true }),
    expiresAt: (0, pg_core_1.timestamp)('expires_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=api-keys.js.map