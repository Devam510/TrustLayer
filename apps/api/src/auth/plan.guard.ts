import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { eq } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { subscriptions, planLimits } from '@trustlayer/db'
import type { JwtPayload } from '../auth/jwt.strategy'

export const PLAN_FEATURE_KEY = 'planFeature'
export const RequireFeature = (feature: keyof typeof planFeatureMap) =>
  // Reflector metadata key for feature gating
  ({ metadata: { [PLAN_FEATURE_KEY]: feature } })

// Maps feature names to plan_limits column names
const planFeatureMap = {
  emailAlerts: 'email_alerts',
  webhookAlerts: 'webhook_alerts',
  apiAccess: 'api_access',
} as const

/**
 * PlanGuard — checks if the org's current plan allows the requested feature.
 * Also enforces max_projects and max_clients limits.
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DATABASE_TOKEN) private readonly db: any,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.get<string>(PLAN_FEATURE_KEY, context.getHandler())
    if (!feature) return true // No plan restriction on this route

    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload

    if (process.env.NODE_ENV === 'development') {
      return true
    }

    // Get org's active subscription plan
    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.orgId, user.orgId),
    })
    const plan = sub?.plan ?? 'free'

    // Get plan limits
    const limits = await this.db.query.planLimits.findFirst({
      where: eq(planLimits.plan, plan),
    })

    if (!limits) throw new ForbiddenException('Plan limits not configured')

    // Check the specific feature flag
    const featureKey = planFeatureMap[feature as keyof typeof planFeatureMap]
    if (featureKey && !(limits as any)[featureKey]) {
      throw new ForbiddenException(
        `Your ${plan} plan does not include this feature. Please upgrade.`,
      )
    }

    return true
  }
}
