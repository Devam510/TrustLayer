export interface BankingAdapter {
  /**
   * Create a link token to initiate the provider's connection flow (e.g., Plaid Link)
   */
  createLinkToken(userId: string): Promise<{ linkToken: string; expiration: string }>

  /**
   * Exchange a public token received from the frontend after link completion
   */
  exchangePublicToken(
    publicToken: string,
  ): Promise<{ accessToken: string; itemId: string; institutionName: string; mask: string }>

  /**
   * Fetch the current available balance for a linked account
   */
  getBalance(accessToken: string): Promise<number>
}
