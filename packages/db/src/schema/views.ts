import { pgView } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'
import { organizations } from './organizations'
import { subscriptions } from './subscriptions'

// Drizzle view joining orgs with their active subscription plan
export const orgWithPlan = pgView('org_with_plan').as((qb) =>
  qb
    .select({
      id: organizations.id,
      name: organizations.name,
      ownerId: organizations.ownerId,
      slug: organizations.slug,
      createdAt: organizations.createdAt,
      deletedAt: organizations.deletedAt,
      plan: subscriptions.plan,
      subStatus: subscriptions.status,
      trialEndsAt: subscriptions.trialEndsAt,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(organizations)
    .leftJoin(subscriptions, eq(subscriptions.orgId, organizations.id)),
)

export type OrgWithPlan = typeof orgWithPlan.$inferSelect
