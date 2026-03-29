import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  Get,
  Query,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Request } from 'express'
import { BillingService } from './billing.service'
import { CurrentUser } from '../auth/current-user.decorator'
import { Public } from '../auth/public.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Checkout session' })
  async checkout(
    @CurrentUser() user: JwtPayload,
    @Body() body: { priceId: string; returnUrl: string },
  ) {
    return this.billingService.createCheckoutSession(user.orgId, body.priceId, body.returnUrl)
  }

  @Get('portal')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe Customer Portal session' })
  async portal(
    @CurrentUser() user: JwtPayload,
    @Query('returnUrl') returnUrl: string,
  ) {
    return this.billingService.createPortalSession(user.orgId, returnUrl)
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook receiver (signature-validated)' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.billingService.handleWebhook(req.rawBody!, signature)
    return { received: true }
  }
}
