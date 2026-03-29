import { Controller, Get, Header, Res } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger'
import { Response } from 'express'
import { MetricsService } from './metrics.service'
import { Public } from '../auth/public.decorator'

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiExcludeEndpoint() // Don't show in Swagger (internal)
  @ApiOperation({ summary: 'Prometheus metrics scrape endpoint' })
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics()
    res.send(metrics)
  }
}
