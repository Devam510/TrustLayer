import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid'
import type { BankingAdapter } from './banking.adapter'
import { MetricsService } from '../metrics/metrics.service'

@Injectable()
export class PlaidAdapter implements BankingAdapter {
  private readonly plaid: PlaidApi

  constructor(
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
  ) {
    const plaidConfig = new Configuration({
      basePath:
        PlaidEnvironments[config.getOrThrow<string>('PLAID_ENV') as keyof typeof PlaidEnvironments],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.getOrThrow('PLAID_CLIENT_ID'),
          'PLAID-SECRET': config.getOrThrow('PLAID_SECRET'),
        },
      },
    })
    this.plaid = new PlaidApi(plaidConfig)
  }

  async createLinkToken(userId: string) {
    try {
      const response = await this.plaid.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'TrustLayer',
        products: [Products.Auth, Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
      })
      return {
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
      }
    } catch (err: any) {
      this.metrics.plaidApiErrorsTotal.inc({
        error_code: err?.response?.data?.error_code ?? 'UNKNOWN',
      })
      throw err
    }
  }

  async exchangePublicToken(publicToken: string) {
    try {
      const tokenResponse = await this.plaid.itemPublicTokenExchange({
        public_token: publicToken,
      })
      const accessToken = tokenResponse.data.access_token
      const itemId = tokenResponse.data.item_id

      // Fetch institution info
      const itemResponse = await this.plaid.itemGet({ access_token: accessToken })
      const institutionId = itemResponse.data.item.institution_id

      let institutionName = 'Unknown Bank'
      if (institutionId) {
        const instResponse = await this.plaid.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us],
        })
        institutionName = instResponse.data.institution.name
      }

      // Get account mask
      const accountsResponse = await this.plaid.accountsGet({ access_token: accessToken })
      const mask = accountsResponse.data.accounts[0]?.mask ?? '0000'

      return { accessToken, itemId, institutionName, mask }
    } catch (err: any) {
      this.metrics.plaidApiErrorsTotal.inc({
        error_code: err?.response?.data?.error_code ?? 'UNKNOWN',
      })
      throw err
    }
  }

  async getBalance(accessToken: string): Promise<number> {
    try {
      const response = await this.plaid.accountsBalanceGet({ access_token: accessToken })
      const account = response.data.accounts[0]
      return account?.balances.available ?? account?.balances.current ?? 0
    } catch (err: any) {
      this.metrics.plaidApiErrorsTotal.inc({
        error_code: err?.response?.data?.error_code ?? 'UNKNOWN',
      })
      throw err
    }
  }
}
