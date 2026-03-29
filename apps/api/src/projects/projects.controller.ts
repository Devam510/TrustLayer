import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Public } from '../auth/public.decorator'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto } from './projects.dto'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Public()
  @Get('validate-invite')
  @ApiOperation({ summary: 'Validate an invite token (public — no auth required)' })
  validateInvite(@Query('token') token: string) {
    return this.projectsService.validateInviteToken(token)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new project (generates invite token)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.orgId, user.sub, dto)
  }

  @Get()
  @ApiOperation({ summary: 'List all projects for org' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.projectsService.findAll(user.orgId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project' })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.findOne(id, user.orgId)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, user.orgId, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a project' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.softDelete(id, user.orgId)
  }

  @Post(':id/resend-invite')
  @ApiOperation({ summary: 'Regenerate and resend invite token' })
  resendInvite(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.projectsService.resendInvite(id, user.orgId)
  }

  @Post('accept-invite')
  @ApiOperation({ summary: 'Accept project invite (client flow)' })
  acceptInvite(
    @Query('token') token: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.projectsService.acceptInvite(token, user.sub)
  }
}
