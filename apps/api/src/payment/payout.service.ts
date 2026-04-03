import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import Razorpay from 'razorpay'
import { RAZORPAY_TOKEN } from './razorpay.provider'
import { DATABASE_TOKEN } from '../database/database.module'
import { users } from '@trustlayer/db'

@Injectable()
export class PayoutService {
  constructor(
    @Inject(RAZORPAY_TOKEN) private readonly razorpay: Razorpay,
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly config: ConfigService,
  ) {}

  /**
   * Onboard a freelancer as a Razorpay Route Linked Account.
   * The linked account receives split payments directly at settlement.
   *
   * After creating the account, Razorpay will perform penny-drop verification
   * in the background. A webhook (fund_account.validation.completed) will fire
   * when verification is done.
   */
  async onboardFreelancer(
    userId: string,
    bankDetails: {
      accountNumber: string
      ifsc: string
      accountHolderName: string
      email: string
      businessName?: string
    },
  ) {
    const user = await this.db.query.users.findFirst({ where: eq(users.id, userId) })
    if (!user) throw new NotFoundException('User not found')
    if (user.productRole !== 'freelancer') throw new BadRequestException('Only freelancers can set up bank accounts')

    // Step 1: Create a Razorpay Route Linked Account
    // Linked accounts are sub-merchants on your Route setup.
    const linkedAccount = await (this.razorpay.accounts as any).create({
      email: bankDetails.email,
      profile: {
        category: 'individual',
        subcategory: 'freelancer',
        addresses: {
          registered: {
            street1: 'India',
            city: 'India',
            state: 'IN',
            postal_code: '000000',
            country: 'IN',
          },
        },
      },
      legal_business_name: bankDetails.businessName ?? bankDetails.accountHolderName,
      business_type: 'individual',
      legal_info: {
        pan: 'AAAAA0000A', // Placeholder — real PAN required for production KYC
      },
    })

    // Step 2: Add bank account as settlement destination
    await (this.razorpay.stakeholders as any).create(linkedAccount.id, {
      name: bankDetails.accountHolderName,
      relationship: { director: true },
    })

    // Step 3: Save to DB (unverified until webhook confirms)
    await this.db
      .update(users)
      .set({
        razorpayLinkedAccountId: linkedAccount.id,
        bankAccountVerified: false,
        bankAccountMask: bankDetails.accountNumber.slice(-4),
        bankIfsc: bankDetails.ifsc,
        bankAccountHolderName: bankDetails.accountHolderName,
      })
      .where(eq(users.id, userId))

    return {
      linkedAccountId: linkedAccount.id,
      status: 'pending_verification',
      message: 'Bank account submitted. Verification typically takes 1-2 business days.',
    }
  }

  /**
   * Mark freelancer's bank as verified.
   * Called from the webhook handler when Razorpay confirms the account.
   */
  async markBankVerified(linkedAccountId: string) {
    await this.db
      .update(users)
      .set({ bankAccountVerified: true })
      .where(eq(users.razorpayLinkedAccountId, linkedAccountId))
  }

  /**
   * Get current payout setup status for a freelancer.
   */
  async getPayoutStatus(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        bankAccountVerified: true,
        bankAccountMask: true,
        bankIfsc: true,
        bankAccountHolderName: true,
        razorpayLinkedAccountId: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return {
      isSetup: !!user.razorpayLinkedAccountId,
      isVerified: user.bankAccountVerified,
      bankAccountMask: user.bankAccountMask,
      bankIfsc: user.bankIfsc,
      bankAccountHolderName: user.bankAccountHolderName,
    }
  }
}
