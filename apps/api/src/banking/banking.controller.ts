import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { BankingService } from './banking.service'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('banking')
@ApiBearerAuth()
@Controller('banking')
@Throttle({ default: { ttl: 60_000, limit: 20 } }) // 20 req/min for banking
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  @Post('link-token')
  @ApiOperation({ summary: 'Create a Plaid link token to initiate bank connection' })
  createLinkToken(
    @CurrentUser() user: JwtPayload,
    @Query('countryCode') countryCode = 'US',
  ) {
    return this.bankingService.createLinkToken(user.sub, countryCode)
  }

  @Post('link')
  @ApiOperation({ summary: 'Exchange Plaid public token and link bank account' })
  linkAccount(
    @CurrentUser() user: JwtPayload,
    @Body() body: { publicToken: string; countryCode?: string },
  ) {
    return this.bankingService.linkAccount(
      user.orgId,
      user.sub,
      body.publicToken,
      body.countryCode,
    )
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List linked bank accounts for the org' })
  listAccounts(@CurrentUser() user: JwtPayload) {
    return this.bankingService.listAccounts(user.orgId)
  }

  @Get('accounts/:id/balance')
  @ApiOperation({ summary: 'Fetch current balance for a linked account' })
  getBalance(@Param('id') id: string) {
    return this.bankingService.getBalance(id)
  }
}
