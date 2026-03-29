import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiKeysService } from './api-keys.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const rawKey = request.headers['x-api-key'] as string | undefined

    if (!rawKey) throw new UnauthorizedException('Missing X-API-Key header')
    if (!rawKey.startsWith('tl_live_')) throw new UnauthorizedException('Invalid API key format')

    const key = await this.apiKeysService.resolveKey(rawKey)
    if (!key) throw new UnauthorizedException('Invalid or revoked API key')

    // Inject resolved key context into request
    request.apiKey = key
    request.user = { sub: key.userId, orgId: key.orgId }

    return true
  }
}
