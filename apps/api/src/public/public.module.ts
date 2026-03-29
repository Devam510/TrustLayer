import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { ProjectsModule } from '../projects/projects.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [ProjectsModule, AlertsModule],
  controllers: [PublicController],
})
export class PublicModule {}
