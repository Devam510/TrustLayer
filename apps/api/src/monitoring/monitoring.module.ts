import { Module } from '@nestjs/common'
import { MonitoringService } from './monitoring.service'
import { MonitoringGateway } from './monitoring.gateway'

@Module({
  providers: [MonitoringService],
  controllers: [MonitoringGateway],
  exports: [MonitoringService],
})
export class MonitoringModule {}
