import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private posthog!: PostHog;
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('POSTHOG_API_KEY');
    const host = this.configService.get<string>('POSTHOG_HOST', 'https://us.i.posthog.com');
    
    if (apiKey) {
      this.posthog = new PostHog(apiKey, { host });
      this.logger.log('PostHog initialized');
    } else {
      this.logger.warn('POSTHOG_API_KEY not found. Analytics disabled.');
    }
  }

  onModuleDestroy() {
    if (this.posthog) {
      this.posthog.shutdown();
    }
  }

  track(distinctId: string, event: string, properties?: Record<string, any>) {
    if (!this.posthog) return;

    this.posthog.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        source: 'api',
      },
    });
  }

  identify(distinctId: string, traits: Record<string, any>) {
    if (!this.posthog) return;

    this.posthog.identify({
      distinctId,
      properties: traits,
    });
  }

  group(groupType: string, groupKey: string, traits?: Record<string, any>) {
    if (!this.posthog) return;

    this.posthog.groupIdentify({
      groupType,
      groupKey,
      properties: traits,
    });
  }
}
