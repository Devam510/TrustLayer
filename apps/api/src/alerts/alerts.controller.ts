import { Controller, Get, Post, Param } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AlertsService } from './alerts.service'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List all alerts for current user' })
  list(@CurrentUser() user: JwtPayload) {
    return this.alertsService.listAlerts(user.sub)
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  acknowledge(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.alertsService.acknowledge(id, user.sub)
  }
}
