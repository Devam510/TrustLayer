import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { readFileSync } from 'fs'
import { resolve } from 'path'

export interface JwtPayload {
  sub: string    // user ID
  email: string
  orgId: string
  role: string
  iat?: number
  exp?: number
}

function loadPublicKey(): string {
  // Support both path-based (dev) and raw env-var (prod/Doppler)
  const rawKey = process.env.JWT_PUBLIC_KEY
  if (rawKey) return rawKey.replace(/\\n/g, '\n')

  const keyPath = process.env.JWT_PUBLIC_KEY_PATH
  if (keyPath) return readFileSync(resolve(keyPath), 'utf8')

  throw new Error('[auth] Neither JWT_PUBLIC_KEY nor JWT_PUBLIC_KEY_PATH is set')
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      ignoreExpiration: false,
      secretOrKey: loadPublicKey(),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) throw new UnauthorizedException()
    return payload
  }
}
