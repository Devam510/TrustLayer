import { Controller, Get, Param, Sse, MessageEvent, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Observable, fromEvent, map } from 'rxjs'
import type { TrustStatusEvent } from './monitoring.service'

@ApiTags('monitoring')
@ApiBearerAuth()
@Controller('monitoring')
export class MonitoringGateway {
  constructor(private readonly events: EventEmitter2) {}

  /**
   * SSE stream for real-time trust status updates per project.
   * Client connects once and receives push events on balance changes.
   */
  @Sse('stream/:projectId')
  @ApiOperation({ summary: 'SSE stream for real-time trust status updates' })
  stream(@Param('projectId') projectId: string): Observable<MessageEvent> {
    return fromEvent(this.events, `trust.${projectId}`).pipe(
      map((event: unknown) => ({
        data: event as TrustStatusEvent,
        type: 'trust-status',
        id: Date.now().toString(),
      })),
    )
  }
}
