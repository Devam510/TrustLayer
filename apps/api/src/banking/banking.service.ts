import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_TOKEN } from '../database/database.module'
import { bankAccounts } from '@trustlayer/db'
import { PlaidAdapter } from './plaid.adapter'
import { encrypt, decrypt, maybeReencrypt } from '@trustlayer/crypto'

@Injectable()
export class BankingService {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly plaidAdapter: PlaidAdapter,
  ) {}

  /**
   * BankingFactory: returns the correct adapter by country/provider.
   * Architected for TrueLayer (EU/UK) and Basiq (AU) future expansion.
   */
  getAdapter(countryCode: string, _provider?: string) {
    // US: Plaid
    if (countryCode === 'US') return this.plaidAdapter
    // EU/UK: TrueLayer (not yet implemented — placeholder)
    if (['GB', 'EU'].includes(countryCode)) {
      throw new BadRequestException('TrueLayer adapter coming soon for EU/UK')
    }
    // AU: Basiq (not yet implemented)
    if (countryCode === 'AU') {
      throw new BadRequestException('Basiq adapter coming soon for AU')
    }
    throw new BadRequestException(`Unsupported country: ${countryCode}`)
  }

  async createLinkToken(userId: string, countryCode = 'US') {
    const adapter = this.getAdapter(countryCode)
    return adapter.createLinkToken(userId)
  }

  async linkAccount(
    orgId: string,
    userId: string,
    publicToken: string,
    countryCode = 'US',
  ) {
    const adapter = this.getAdapter(countryCode)
    const { accessToken, itemId, institutionName, mask } =
      await adapter.exchangePublicToken(publicToken)

    // Encrypt access token with current key version before storage
    const encryptedToken = encrypt(accessToken)

    const [account] = await this.db
      .insert(bankAccounts)
      .values({
        orgId,
        userId,
        countryCode,
        bankingProvider: 'plaid',
        providerItemId: itemId,
        accessToken: encryptedToken,
        keyVersion: encryptedToken.readUInt8(0),
        institutionName,
        accountMask: mask,
        status: 'active',
      })
      .returning()

    return account
  }

  async getBalance(accountId: string): Promise<number> {
    const account = await this.db.query.bankAccounts.findFirst({
      where: eq(bankAccounts.id, accountId),
    })
    if (!account) throw new NotFoundException('Bank account not found')

    // Lazy key rotation: if encrypted with old version, re-encrypt and persist
    const { data: latestToken, needsUpdate } = maybeReencrypt(account.accessToken)
    if (needsUpdate) {
      await this.db
        .update(bankAccounts)
        .set({ accessToken: latestToken, keyVersion: latestToken.readUInt8(0) })
        .where(eq(bankAccounts.id, accountId))
    }

    const rawToken = decrypt(latestToken)
    const adapter = this.getAdapter(account.countryCode ?? 'US')
    return adapter.getBalance(rawToken)
  }

  async listAccounts(orgId: string) {
    return this.db.query.bankAccounts.findMany({
      where: eq(bankAccounts.orgId, orgId),
      columns: {
        accessToken: false, // Never return encrypted token to client
      },
    })
  }

  async setReauthRequired(accountId: string) {
    await this.db
      .update(bankAccounts)
      .set({ status: 'needs_reauth' })
      .where(eq(bankAccounts.id, accountId))
  }
}
