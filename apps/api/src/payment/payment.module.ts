import { Module } from '@nestjs/common'
import { RazorpayProvider } from './razorpay.provider'
import { SubscriptionService } from './subscription.service'
import { EscrowService } from './escrow.service'
import { PayoutService } from './payout.service'
import { PaymentController } from './payment.controller'
import { WebhookController } from './webhook.controller'
import { MetricsModule } from '../metrics/metrics.module'

@Module({
  imports: [MetricsModule],
  providers: [RazorpayProvider, SubscriptionService, EscrowService, PayoutService],
  controllers: [PaymentController, WebhookController],
  exports: [EscrowService, SubscriptionService, PayoutService],
})
export class PaymentModule {}
