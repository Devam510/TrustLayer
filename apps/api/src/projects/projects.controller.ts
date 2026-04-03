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
  ParseIntPipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Public } from '../auth/public.decorator'
import { ProjectsService } from './projects.service'
import { CreateProjectDto, UpdateProjectDto } from './projects.dto'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'
import { EscrowService } from '../payment/escrow.service'

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly escrowService: EscrowService,
  ) {}

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

  // ─── Milestone Escrow Endpoints ───────────────────────────────

  @Post(':id/milestones/:index/fund')
  @ApiOperation({
    summary: 'Client: Create Razorpay order to fund a milestone (returns order ID for checkout)',
  })
  fundMilestone(
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.escrowService.fundMilestone(id, index, user.sub)
  }

  @Post(':id/milestones/:index/release')
  @ApiOperation({
    summary: 'Client: Approve milestone and release escrowed funds to freelancer',
  })
  releaseMilestone(
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.escrowService.releaseMilestone(id, index, user.sub)
  }

  @Post(':id/milestones/:index/refund')
  @ApiOperation({
    summary: 'Client: Refund a funded milestone (only before release)',
  })
  refundMilestone(
    @Param('id') id: string,
    @Param('index', ParseIntPipe) index: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.escrowService.refundMilestone(id, index, user.sub)
  }
}
