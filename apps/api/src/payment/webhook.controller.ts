import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  HttpCode,
  Logger,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Request } from 'express'
import { Public } from '../auth/public.decorator'
import { SubscriptionService } from './subscription.service'
import { EscrowService } from './escrow.service'
import { PayoutService } from './payout.service'
import { ConfigService } from '@nestjs/config'
import Razorpay from 'razorpay'
import * as crypto from 'crypto'
import { Inject } from '@nestjs/common'
import { RAZORPAY_TOKEN } from './razorpay.provider'

@ApiTags('webhooks')
@Controller('payment/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    @Inject(RAZORPAY_TOKEN) private readonly razorpay: Razorpay,
    private readonly subscriptionService: SubscriptionService,
    private readonly escrowService: EscrowService,
    private readonly payoutService: PayoutService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Single Razorpay webhook endpoint receiving all events.
   * Register this URL in Razorpay Dashboard → Webhooks.
   * Must be PUBLIC (no JWT auth) — signature-verified instead.
   */
  @Public()
  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Razorpay webhook receiver (signature-verified)' })
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody as Buffer
    if (!rawBody) throw new BadRequestException('Raw body missing')

    const bodyStr = rawBody.toString('utf-8')
    const secret = this.config.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET')

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyStr)
      .digest('hex')
    const isValid = expectedSignature === signature

    if (!isValid) {
      this.logger.warn('Razorpay webhook signature verification FAILED')
      throw new BadRequestException('Webhook signature verification failed')
    }

    const event = JSON.parse(bodyStr)
    this.logger.log(`Razorpay webhook: ${event.event}`)

    await this.dispatch(event)
    return { received: true }
  }

  private async dispatch(event: any) {
    try {
      switch (event.event) {
        // ─── Payment Events ────────────────────────────────
        case 'payment.captured': {
          const payment = event.payload.payment.entity
          // Find the transfer ID if it was created as part of a Route order
          const transferId = payment.transfer_id ?? null
          await this.escrowService.onPaymentCaptured(payment.id, payment.order_id, transferId)
          break
        }

        case 'payment.failed': {
          // No action needed — the escrow stays 'pending', client retries
          this.logger.warn(`Payment failed: ${event.payload.payment.entity.id}`)
          break
        }

        // ─── Transfer Events (Route) ───────────────────────
        case 'transfer.settled': {
          // Funds settled to the freelancer's linked account — already handled by release flow
          this.logger.log(`Route transfer settled: ${event.payload.transfer?.entity?.id}`)
          break
        }

        // ─── Subscription Events ───────────────────────────
        case 'subscription.charged':
        case 'subscription.cancelled':
        case 'subscription.completed':
        case 'subscription.halted': {
          const rawBody = JSON.stringify(event)
          await this.subscriptionService.handleWebhook(rawBody, '') // Already verified above
          break
        }

        // ─── Account Verification Events ──────────────────
        case 'account.activated': {
          // Freelancer's linked account is now active (KYC verified by Razorpay)
          const account = event.payload.account?.entity
          if (account?.id) {
            await this.payoutService.markBankVerified(account.id)
            this.logger.log(`Freelancer account activated: ${account.id}`)
          }
          break
        }

        default:
          this.logger.debug(`Unhandled Razorpay event: ${event.event}`)
      }
    } catch (err) {
      this.logger.error(`Webhook dispatch error for ${event.event}: ${err}`)
      // Still return 200 to prevent Razorpay retries — log and investigate
    }
  }
}
