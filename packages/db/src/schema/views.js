"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgWithPlan = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const organizations_1 = require("./organizations");
const subscriptions_1 = require("./subscriptions");
// Drizzle view joining orgs with their active subscription plan
exports.orgWithPlan = (0, pg_core_1.pgView)('org_with_plan').as((qb) => qb
    .select({
    id: organizations_1.organizations.id,
    name: organizations_1.organizations.name,
    ownerId: organizations_1.organizations.ownerId,
    slug: organizations_1.organizations.slug,
    createdAt: organizations_1.organizations.createdAt,
    deletedAt: organizations_1.organizations.deletedAt,
    plan: subscriptions_1.subscriptions.plan,
    subStatus: subscriptions_1.subscriptions.status,
    trialEndsAt: subscriptions_1.subscriptions.trialEndsAt,
    currentPeriodEnd: subscriptions_1.subscriptions.currentPeriodEnd,
})
    .from(organizations_1.organizations)
    .leftJoin(subscriptions_1.subscriptions, (0, drizzle_orm_1.eq)(subscriptions_1.subscriptions.orgId, organizations_1.organizations.id)));
//# sourceMappingURL=views.js.map