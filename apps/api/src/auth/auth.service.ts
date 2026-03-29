import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash, compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { sign } from 'jsonwebtoken'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { DATABASE_TOKEN } from '../database/database.module'
import {
  users,
  organizations,
  orgMembers,
  subscriptions,
} from '@trustlayer/db'
import { RegisterDto, LoginDto } from './auth.dto'

@Injectable()
export class AuthService {
  private readonly privateKey: string

  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    config: ConfigService,
  ) {
    // Load RS256 private key for JWT signing
    const rawKey = config.get<string>('JWT_PRIVATE_KEY')
    if (rawKey) {
      this.privateKey = rawKey.replace(/\\n/g, '\n')
    } else {
      const keyPath = config.getOrThrow<string>('JWT_PRIVATE_KEY_PATH')
      this.privateKey = readFileSync(resolve(keyPath), 'utf8')
    }
  }

  /**
   * Atomic registration:
   * 1. User + Personal Org + OrgMember(owner) + Free Subscription — all in one TX
   * 2. Email verification token generated
   * 3. After TX commits: issue JWT (no Stripe Customer here; Stripe runs after TX)
   */
  async register(dto: RegisterDto) {
    // Check for duplicate email before transaction
    const existing = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    })
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await hash(dto.password, 12)
    const emailVerificationToken = randomBytes(32).toString('hex')
    const orgSlug = dto.email.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? 'org'

    // Atomic transaction: User → Org → OrgMember → Subscription
    const result = await (this.db as any).transaction(async (tx: any) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: dto.email,
          name: dto.name,
          passwordHash,
          productRole: dto.productRole ?? 'freelancer',
          emailVerificationToken,
        })
        .returning()

      const [org] = await tx
        .insert(organizations)
        .values({
          name: `${dto.name}'s Organization`,
          ownerId: user.id,
          slug: `${orgSlug}-${user.id.slice(0, 8)}`,
        })
        .returning()

      await tx.insert(orgMembers).values({
        orgId: org.id,
        userId: user.id,
        role: 'owner',
      })

      await tx.insert(subscriptions).values({
        orgId: org.id,
        plan: 'free',
        status: 'active',
      })

      return { user, org }
    })

    // Issue JWT after TX (Stripe Customer creation also happens here in billing service)
    const token = this.signJwt(result.user.id, result.user.email, result.org.id, 'owner')

    return {
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        productRole: result.user.productRole,
        emailVerified: result.user.emailVerified,
      },
      emailVerificationToken,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    })
    if (!user || user.deletedAt) throw new UnauthorizedException('Invalid credentials')

    const valid = await compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    // Get primary org
    const member = await this.db.query.orgMembers.findFirst({
      where: eq(orgMembers.userId, user.id),
    })

    const token = this.signJwt(
      user.id,
      user.email,
      member?.orgId ?? '',
      member?.role ?? 'member',
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        productRole: user.productRole,
        emailVerified: user.emailVerified,
      },
    }
  }

  async verifyEmail(token: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.emailVerificationToken, token),
    })
    if (!user) throw new UnauthorizedException('Invalid or expired verification token')

    await this.db
      .update(users)
      .set({ emailVerified: true, emailVerificationToken: null, updatedAt: new Date() })
      .where(eq(users.id, user.id))

    return { verified: true }
  }

  private signJwt(userId: string, email: string, orgId: string, role: string): string {
    return sign({ sub: userId, email, orgId, role }, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '7d',
    })
  }
}
