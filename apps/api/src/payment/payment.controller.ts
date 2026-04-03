import { Controller, Post, Get, Body, Param, UseGuards, Patch } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SubscriptionService } from './subscription.service'
import { EscrowService } from './escrow.service'
import { PayoutService } from './payout.service'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('payment')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly escrowService: EscrowService,
    private readonly payoutService: PayoutService,
  ) {}

  // ─── Platform Subscription Endpoints ──────────────────────────

  @Post('subscribe')
  @ApiOperation({ summary: 'Create a Razorpay subscription for the org (Pro/Agency)' })
  async subscribe(
    @CurrentUser() user: JwtPayload,
    @Body() body: { planId: string },
  ) {
    return this.subscriptionService.createSubscription(user.orgId, body.planId)
  }

  @Post('cancel-subscription')
  @ApiOperation({ summary: 'Cancel the current subscription (downgrades to free at period end)' })
  async cancelSubscription(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.cancelSubscription(user.orgId)
  }

  // ─── Freelancer Bank Setup Endpoints ──────────────────────────

  @Post('bank-account')
  @ApiOperation({ summary: 'Freelancer: Submit bank account details for Razorpay Route onboarding' })
  async setupBankAccount(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      accountNumber: string
      ifsc: string
      accountHolderName: string
      businessName?: string
    },
  ) {
    return this.payoutService.onboardFreelancer(user.sub, {
      ...body,
      email: user.email,
    })
  }

  @Get('bank-account/status')
  @ApiOperation({ summary: 'Freelancer: Get bank verification status' })
  async bankAccountStatus(@CurrentUser() user: JwtPayload) {
    return this.payoutService.getPayoutStatus(user.sub)
  }

  // ─── Escrow Status Endpoint ────────────────────────────────────

  @Get('escrow/:projectId')
  @ApiOperation({ summary: 'Get escrow summary for a project' })
  async escrowSummary(@Param('projectId') projectId: string) {
    return this.escrowService.getEscrowSummary(projectId)
  }
}
