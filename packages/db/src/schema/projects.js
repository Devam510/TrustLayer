"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projects = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const organizations_1 = require("./organizations");
const users_1 = require("./users");
const bank_accounts_1 = require("./bank-accounts");
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orgId: (0, pg_core_1.uuid)('org_id')
        .notNull()
        .references(() => organizations_1.organizations.id),
    clientId: (0, pg_core_1.uuid)('client_id').references(() => users_1.users.id),
    freelancerId: (0, pg_core_1.uuid)('freelancer_id').references(() => users_1.users.id),
    title: (0, pg_core_1.varchar)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    budget: (0, pg_core_1.decimal)('budget', { precision: 12, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)('currency', { length: 3 }).default('USD').notNull(),
    countryCode: (0, pg_core_1.varchar)('country_code', { length: 2 }).default('US').notNull(),
    bankAccountId: (0, pg_core_1.uuid)('bank_account_id').references(() => bank_accounts_1.bankAccounts.id),
    status: (0, pg_core_1.varchar)('status')
        .default('draft')
        .notNull()
        .$type(),
    bufferPct: (0, pg_core_1.decimal)('buffer_pct', { precision: 5, scale: 2 }).default('10.00').notNull(),
    milestones: (0, pg_core_1.jsonb)('milestones').default([]).notNull(),
    inviteToken: (0, pg_core_1.varchar)('invite_token').unique(),
    inviteTokenExpiresAt: (0, pg_core_1.timestamp)('invite_token_expires_at', { withTimezone: true }),
    inviteTokenUsed: (0, pg_core_1.boolean)('invite_token_used').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deleted_at', { withTimezone: true }),
});
//# sourceMappingURL=projects.js.map