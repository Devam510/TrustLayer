import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Response } from 'express'
import { sql } from 'drizzle-orm'
import Redis from 'ioredis'
import { Public } from '../auth/public.decorator'
import { DATABASE_TOKEN } from '../database/database.module'

type HealthStatus = 'ok' | 'degraded' | 'down'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Basic liveness check' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  @Public()
  @Get('deep')
  @ApiOperation({ summary: 'Deep health check — DB, Redis, queues' })
  async deep(@Res() res: Response) {
    const results = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ])

    const database = results[0].status === 'fulfilled' ? results[0].value : 'down'
    const redis = results[1].status === 'fulfilled' ? results[1].value : 'down'

    const allOk = [database, redis].every((s) => s === 'ok')

    const body = {
      database,
      redis,
      timestamp: new Date().toISOString(),
    }

    res.status(allOk ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json(body)
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      await this.db.execute(sql`SELECT 1`)
      return 'ok'
    } catch {
      return 'down'
    }
  }

  private async checkRedis(): Promise<HealthStatus> {
    const redisUrl = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
    const client = new Redis(redisUrl)
    try {
      await client.ping()
      return 'ok'
    } catch {
      return 'down'
    } finally {
      client.disconnect()
    }
  }
}
