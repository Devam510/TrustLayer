import { Module } from '@nestjs/common'
import { OrgsService } from './orgs.service'
import { OrgsController } from './orgs.controller'
import { BillingModule } from '../billing/billing.module'

@Module({
  imports: [BillingModule],
  providers: [OrgsService],
  controllers: [OrgsController],
  exports: [OrgsService],
})
export class OrgsModule {}
