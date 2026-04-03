import { Module } from '@nestjs/common'
import { OrgsService } from './orgs.service'
import { OrgsController } from './orgs.controller'
import { PaymentModule } from '../payment/payment.module'

@Module({
  imports: [PaymentModule],
  providers: [OrgsService],
  controllers: [OrgsController],
  exports: [OrgsService],
})
export class OrgsModule {}
