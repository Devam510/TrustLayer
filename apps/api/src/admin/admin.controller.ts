import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AdminGuard } from '../auth/admin.guard'
import { Public } from '../auth/public.decorator'

@ApiTags('admin')
@Public() // JWT skipped — AdminGuard handles its own IP check
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  @Get('metrics/summary')
  @ApiOperation({ summary: 'Admin: high-level metrics summary (MRR, DAU, conversions)' })
  metricsSummary() {
    // TODO: Phase 5 — query and aggregate real data
    return {
      note: 'Admin BI endpoint — full implementation in Phase 5',
      dau: 0,
      mrr: 0,
      trialConversionRate: 0,
    }
  }

  @Get('health/dlq')
  @ApiOperation({ summary: 'Admin: check DLQ depths across all queues' })
  dlqStatus() {
    // TODO: Phase 5 — query BullMQ DLQ depths
    return {
      note: 'DLQ status endpoint — full implementation in Phase 5',
      queues: {},
    }
  }
}
