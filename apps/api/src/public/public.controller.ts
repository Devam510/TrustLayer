import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiKeyGuard } from '../api-keys/api-key.guard';
import { ProjectsService } from '../projects/projects.service';
import { AlertsService } from '../alerts/alerts.service';
import { Public } from '../auth/public.decorator';

@Controller('v1')
@UseGuards(ApiKeyGuard) // Applies timingSafeEqual key hashing
@Public() // Bypass normal JWT Auth guard for public API routes
export class PublicController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly alertsService: AlertsService,
  ) {}

  @Get('projects')
  async listProjects(@Req() req: any) {
    const orgId = req.orgId; // Injected by ApiKeyGuard via token metadata
    return this.projectsService.findAll(orgId);
  }

  @Get('projects/:id')
  async getProject(@Req() req: any, @Param('id') projectId: string) {
    const orgId = req.orgId;
    return this.projectsService.findOne(projectId, orgId);
  }

  @Get('alerts')
  async listAlerts(@Req() req: any) {
    const orgId = req.orgId;
    // Assuming alertsService has a read all method for the org
    return this.alertsService.listRecentAlerts(orgId); // Stubbed method usage
  }
}
