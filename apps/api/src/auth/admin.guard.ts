import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'

/**
 * AdminGuard — restricts access to admin endpoints by IP address.
 * Allowed IPs configured via ADMIN_ALLOWED_IPS env var (comma-separated).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const allowedIps = (process.env.ADMIN_ALLOWED_IPS ?? '127.0.0.1,::1')
      .split(',')
      .map((ip) => ip.trim())

    const request = context.switchToHttp().getRequest()
    const clientIp =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ??
      request.socket.remoteAddress ??
      ''

    if (!allowedIps.includes(clientIp)) {
      throw new ForbiddenException('Admin access denied')
    }

    return true
  }
}
