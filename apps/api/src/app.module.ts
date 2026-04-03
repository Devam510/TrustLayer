import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { SentryModule } from '@sentry/nestjs/setup'

import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { HealthModule } from './health/health.module'
import { MetricsModule } from './metrics/metrics.module'
import { PaymentModule } from './payment/payment.module'
import { ProjectsModule } from './projects/projects.module'
import { MonitoringModule } from './monitoring/monitoring.module'
import { AlertsModule } from './alerts/alerts.module'
import { ApiKeysModule } from './api-keys/api-keys.module'
import { AdminModule } from './admin/admin.module'
import { ComplianceModule } from './compliance/compliance.module'

@Module({
  imports: [
    // Config — loaded from .env / Doppler
    ConfigModule.forRoot({ isGlobal: true }),

    // Sentry — must be first module
    SentryModule.forRoot(),

    // Pino structured logging
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers["x-api-key"]'],
      },
    }),

    // Rate limiting — global 100 req/min per IP
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60_000,
        limit: 100,
      },
    ]),

    // Cron scheduling for retention jobs
    ScheduleModule.forRoot(),

    // Event emitter for SSE broadcasting
    EventEmitterModule.forRoot(),

    // Feature modules
    DatabaseModule,
    AuthModule,
    HealthModule,
    MetricsModule,
    PaymentModule,
    ProjectsModule,
    MonitoringModule,
    AlertsModule,
    ApiKeysModule,
    AdminModule,
    ComplianceModule,
  ],
})
export class AppModule {}
