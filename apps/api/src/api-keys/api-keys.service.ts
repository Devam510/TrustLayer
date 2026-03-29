import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import { createHash, timingSafeEqual, randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { apiKeys } from '@trustlayer/db'

@Injectable()
export class ApiKeysService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: any) {}

  /**
   * Generate a new API key.
   * Raw key format: tl_live_{random 32 hex chars}
   * Stored: SHA-256 hash only. Prefix stored for display.
   */
  async createKey(orgId: string, userId: string, name: string, scopes: string[]) {
    const rawKey = `tl_live_${randomBytes(16).toString('hex')}`
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    // Prefix = tl_live_ + first 8 chars of the random part
    const keyPrefix = rawKey.slice(0, 'tl_live_'.length + 8)

    const [key] = await this.db
      .insert(apiKeys)
      .values({ orgId, userId, name, keyHash, keyPrefix, scopes })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        createdAt: apiKeys.createdAt,
      })

    // Return raw key ONCE — never stored. User must copy it.
    return { ...key, rawKey }
  }

  async listKeys(orgId: string) {
    return this.db.query.apiKeys.findMany({
      where: eq(apiKeys.orgId, orgId),
      columns: {
        keyHash: false, // Never return hash
      },
    })
  }

  async revokeKey(id: string, orgId: string) {
    await this.db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id))
    return { revoked: true }
  }

  /**
   * Resolve API key from raw value using SHA-256 + timingSafeEqual for constant-time comparison.
   * Resistant to timing attacks.
   */
  async resolveKey(rawKey: string) {
    const incoming = Buffer.from(
      createHash('sha256').update(rawKey).digest('hex'),
      'utf8',
    )

    // Get by prefix (fast pre-filter) — tl_live_{first 8}
    const prefix = rawKey.slice(0, 'tl_live_'.length + 8)
    const candidates = await this.db.query.apiKeys.findMany({
      where: eq(apiKeys.keyPrefix, prefix),
    })

    for (const candidate of candidates) {
      const stored = Buffer.from(candidate.keyHash, 'utf8')
      if (stored.length === incoming.length && timingSafeEqual(stored, incoming)) {
        // Update last_used_at
        await this.db
          .update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, candidate.id))
        return candidate
      }
    }

    return null
  }
}
