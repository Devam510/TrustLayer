import { Controller, Get, Param, Sse, MessageEvent, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Observable, fromEvent, map, merge, of } from 'rxjs'
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
    // Send an immediate simulated event when connected to resolve the UI loading state
    const initialMockEvent = of({
      data: {
        projectId,
        status: 'safe',
        balance: 10000,
        budget: 10000,
        confidence: 'high',
        fundStability: 'stable',
        checkedAt: new Date().toISOString(),
      } as TrustStatusEvent,
      type: 'trust-status',
      id: Date.now().toString(),
    })

    // Listen to real events if they get fired from the backend system
    const liveEvents = fromEvent(this.events, `trust.${projectId}`).pipe(
      map((event: unknown) => ({
        data: event as TrustStatusEvent,
        type: 'trust-status',
        id: Date.now().toString(),
      })),
    )

    return merge(initialMockEvent, liveEvents)
  }
}
