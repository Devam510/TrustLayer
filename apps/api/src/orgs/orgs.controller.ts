import { Controller, Get, Delete, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { OrgsService } from './orgs.service'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('orgs')
@ApiBearerAuth()
@Controller('orgs')
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get('me')
  @ApiOperation({ summary: "Get current user's organization" })
  getMyOrg(@CurrentUser() user: JwtPayload) {
    return this.orgsService.getOrg(user.orgId)
  }

  @Get('me/members')
  @ApiOperation({ summary: 'List org members' })
  getMembers(@CurrentUser() user: JwtPayload) {
    return this.orgsService.getMembers(user.orgId)
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft-delete org (cancels Razorpay subscription)' })
  deleteOrg(@CurrentUser() user: JwtPayload) {
    return this.orgsService.softDeleteOrg(user.orgId)
  }
}
