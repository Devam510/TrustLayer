import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ApiKeysService } from './api-keys.service'
import { CurrentUser } from '../auth/current-user.decorator'
import type { JwtPayload } from '../auth/jwt.strategy'

@ApiTags('api-keys')
@ApiBearerAuth()
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key (raw key shown ONCE)' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { name: string; scopes: string[] },
  ) {
    return this.apiKeysService.createKey(user.orgId, user.sub, body.name, body.scopes)
  }

  @Get()
  @ApiOperation({ summary: 'List API keys for org (no hashes returned)' })
  list(@CurrentUser() user: JwtPayload) {
    return this.apiKeysService.listKeys(user.orgId)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  revoke(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.apiKeysService.revokeKey(id, user.orgId)
  }
}
