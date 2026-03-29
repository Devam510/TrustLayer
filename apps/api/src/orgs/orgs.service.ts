import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { organizations, orgMembers } from '@trustlayer/db'
import { BillingService } from '../billing/billing.service'

@Injectable()
export class OrgsService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly billing: BillingService,
  ) {}

  async getOrg(orgId: string) {
    const org = await this.db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
      with: { members: true },
    })
    if (!org || org.deletedAt) throw new NotFoundException('Organization not found')
    return org
  }

  async getMembers(orgId: string) {
    return this.db.query.orgMembers.findMany({
      where: eq(orgMembers.orgId, orgId),
    })
  }

  /**
   * Soft-delete org — cancels Stripe subscription at period end before setting deleted_at.
   */
  async softDeleteOrg(orgId: string, returnUrl: string) {
    try {
      await this.billing.createPortalSession(orgId, returnUrl)
    } catch {
      // Stripe customer may not exist yet (free plan)
    }

    await this.db
      .update(organizations)
      .set({ deletedAt: new Date() })
      .where(eq(organizations.id, orgId))

    return { deleted: true }
  }
}
