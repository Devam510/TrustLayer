import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { MonitoringService } from './monitoring.service'
import { MonitoringGateway } from './monitoring.gateway'
import { MonitoringScheduler } from './monitoring.scheduler'
import {
  CriticalEscrowProcessor,
  StandardEscrowProcessor,
  FreeEscrowProcessor,
} from './escrow-check.processor'
import {
  QUEUE_ESCROW_CHECK_CRITICAL,
  QUEUE_ESCROW_CHECK_STANDARD,
  QUEUE_ESCROW_CHECK_FREE,
} from './queue.constants'

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_ESCROW_CHECK_CRITICAL },
      { name: QUEUE_ESCROW_CHECK_STANDARD },
      { name: QUEUE_ESCROW_CHECK_FREE },
    ),
  ],
  providers: [
    MonitoringService,
    MonitoringScheduler,
    CriticalEscrowProcessor,
    StandardEscrowProcessor,
    FreeEscrowProcessor,
  ],
  controllers: [MonitoringGateway],
  exports: [MonitoringService],
})
export class MonitoringModule {}

