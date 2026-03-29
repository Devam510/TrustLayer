"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceChecks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const projects_1 = require("./projects");
const bank_accounts_1 = require("./bank-accounts");
// NOTE: balance_checks is partitioned by RANGE (checked_at).
// The Drizzle schema defines the parent table structure only.
// partition setup is done in the db:seed / init script via pg_partman
// PK must include partition key (checked_at) to satisfy pg constraint.
exports.balanceChecks = (0, pg_core_1.pgTable)('balance_checks', {
    id: (0, pg_core_1.uuid)('id').defaultRandom().notNull(),
    checkedAt: (0, pg_core_1.timestamp)('checked_at', { withTimezone: true }).defaultNow().notNull(),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => projects_1.projects.id, { onDelete: 'cascade' }),
    bankAccountId: (0, pg_core_1.uuid)('bank_account_id').references(() => bank_accounts_1.bankAccounts.id),
    balance: (0, pg_core_1.decimal)('balance', { precision: 12, scale: 2 }),
    budget: (0, pg_core_1.decimal)('budget', { precision: 12, scale: 2 }),
    bufferThreshold: (0, pg_core_1.decimal)('buffer_threshold', { precision: 12, scale: 2 }),
    isSufficient: (0, pg_core_1.boolean)('is_sufficient'),
}, (table) => [(0, pg_core_1.primaryKey)({ columns: [table.id, table.checkedAt] })]);
//# sourceMappingURL=balance-checks.js.map