import { Module } from '@nestjs/common'
import { BankingService } from './banking.service'
import { BankingController } from './banking.controller'
import { PlaidAdapter } from './plaid.adapter'

@Module({
  providers: [BankingService, PlaidAdapter],
  controllers: [BankingController],
  exports: [BankingService],
})
export class BankingModule {}
