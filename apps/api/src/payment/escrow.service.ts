import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq, and, sum, sql } from 'drizzle-orm'
import Razorpay from 'razorpay'
import { RAZORPAY_TOKEN } from './razorpay.provider'
import { DATABASE_TOKEN } from '../database/database.module'
import { projects, escrowTransactions, users } from '@trustlayer/db'

const PLATFORM_FEE_PERCENT = 1 // 1% platform fee

@Injectable()
export class EscrowService {
  constructor(
    @Inject(RAZORPAY_TOKEN) private readonly razorpay: Razorpay,
    @Inject(DATABASE_TOKEN) private readonly db: any,
    private readonly config: ConfigService,
  ) {}

  /**
   * Client initiates funding for a milestone.
   * Creates a Razorpay Order with Route direct transfer setup.
   * Returns order data for the frontend Razorpay Checkout widget.
   *
   * Flow: Client pays → Razorpay captures → 99% auto-transferred to freelancer's
   *       Razorpay Linked Account on settlement.
   */
  async fundMilestone(projectId: string, milestoneIndex: number, clientUserId: string) {
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.clientId !== clientUserId) throw new ForbiddenException('Only the client can fund milestones')

    // Validate milestone exists
    const milestones = project.milestones as any[]
    const milestone = milestones?.[milestoneIndex]
    if (!milestone) throw new BadRequestException(`Milestone at index ${milestoneIndex} does not exist`)
    if (milestone.status === 'funded' || milestone.status === 'released') {
      throw new BadRequestException('Milestone is already funded or released')
    }

    // Get freelancer's Razorpay Linked Account ID
    const freelancer = await this.db.query.users.findFirst({
      where: eq(users.id, project.freelancerId),
    })
    if (!freelancer?.razorpayLinkedAccountId) {
      throw new BadRequestException(
        'Freelancer has not set up their bank account yet. Ask them to complete bank setup first.',
      )
    }

    const amountInPaise = Math.round(Number(milestone.amount) * 100) // Razorpay uses paise
    const platformFeeInPaise = Math.round(amountInPaise * (PLATFORM_FEE_PERCENT / 100))
    const freelancerAmountInPaise = amountInPaise - platformFeeInPaise

    // Create order with Route transfer — funds split at capture time
    const order = await (this.razorpay.orders as any).create({
      amount: amountInPaise,
      currency: project.currency ?? 'INR',
      notes: {
        projectId,
        milestoneIndex: String(milestoneIndex),
        milestoneTitle: milestone.title ?? `Milestone ${milestoneIndex + 1}`,
        clientUserId,
      },
      transfers: [
        {
          account: freelancer.razorpayLinkedAccountId,
          amount: freelancerAmountInPaise,
          currency: project.currency ?? 'INR',
          notes: {
            projectId,
            milestoneTitle: milestone.title,
          },
          on_hold: 1, // Hold funds until client approves milestone release
          on_hold_until: 0, // No automatic release date — manual release via API
        },
      ],
    })

    // Record pending escrow transaction
    await this.db.insert(escrowTransactions).values({
      projectId,
      milestoneIndex,
      type: 'fund',
      amount: String(milestone.amount),
      currency: project.currency ?? 'INR',
      platformFee: String((Number(milestone.amount) * PLATFORM_FEE_PERCENT) / 100),
      razorpayOrderId: order.id,
      fromUserId: clientUserId,
      toUserId: project.freelancerId,
      status: 'pending',
    })

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: this.config.getOrThrow('RAZORPAY_KEY_ID'),
    }
  }

  /**
   * Client confirms milestone is done — releases held funds to freelancer.
   * Razorpay Route: sets on_hold=false on the transfer → funds settle immediately.
   */
  async releaseMilestone(projectId: string, milestoneIndex: number, clientUserId: string) {
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.clientId !== clientUserId) throw new ForbiddenException('Only the client can release milestones')

    // Find the held escrow transaction for this milestone
    const escrow = await this.db.query.escrowTransactions.findFirst({
      where: and(
        eq(escrowTransactions.projectId, projectId),
        eq(escrowTransactions.milestoneIndex, milestoneIndex),
        eq(escrowTransactions.status, 'held'),
      ),
    })
    if (!escrow) throw new BadRequestException('No held funds found for this milestone. Has the client funded it?')
    if (!escrow.razorpayTransferId) throw new BadRequestException('Transfer ID missing — cannot release')

    // Release held funds via Razorpay Route — 0 = release immediately
    await (this.razorpay.transfers as any).edit(escrow.razorpayTransferId, {
      on_hold: 0,
    })

    // Update escrow record
    await this.db
      .update(escrowTransactions)
      .set({ status: 'released', completedAt: new Date() })
      .where(eq(escrowTransactions.id, escrow.id))

    // Update milestone status in project
    const milestones = project.milestones as any[]
    milestones[milestoneIndex] = { ...milestones[milestoneIndex], status: 'released' }
    await this.db
      .update(projects)
      .set({ milestones: JSON.stringify(milestones), updatedAt: new Date() })
      .where(eq(projects.id, projectId))

    return { released: true, amount: escrow.amount, currency: escrow.currency }
  }

  /**
   * Refund a funded milestone back to the client (before release only).
   * Uses Razorpay payment refund API.
   */
  async refundMilestone(projectId: string, milestoneIndex: number, clientUserId: string) {
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.clientId !== clientUserId) throw new ForbiddenException('Only the client can request refunds')

    const escrow = await this.db.query.escrowTransactions.findFirst({
      where: and(
        eq(escrowTransactions.projectId, projectId),
        eq(escrowTransactions.milestoneIndex, milestoneIndex),
        eq(escrowTransactions.status, 'held'),
      ),
    })
    if (!escrow) throw new BadRequestException('No held funds to refund')
    if (!escrow.razorpayPaymentId) throw new BadRequestException('Payment ID missing — cannot refund')

    await (this.razorpay.payments as any).refund(escrow.razorpayPaymentId, {
      amount: Math.round(Number(escrow.amount) * 100), // paise
      notes: { reason: 'milestone_refund', projectId, milestoneIndex },
    })

    await this.db
      .update(escrowTransactions)
      .set({ status: 'refunded', completedAt: new Date() })
      .where(eq(escrowTransactions.id, escrow.id))

    return { refunded: true, amount: escrow.amount }
  }

  /**
   * Called on payment.captured webhook — mark escrow as held.
   * Razorpay fires this after the client completes checkout.
   */
  async onPaymentCaptured(paymentId: string, orderId: string, transferId?: string) {
    const escrow = await this.db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.razorpayOrderId, orderId),
    })
    if (!escrow) return

    await this.db
      .update(escrowTransactions)
      .set({
        razorpayPaymentId: paymentId,
        razorpayTransferId: transferId ?? null,
        status: 'held',
      })
      .where(eq(escrowTransactions.id, escrow.id))

    // Update project's totalEscrowed cache
    const { rows } = await this.db.execute(
      sql`SELECT COALESCE(SUM(amount), 0) as total FROM escrow_transactions WHERE project_id = ${escrow.projectId} AND status = 'held'`,
    )
    await this.db
      .update(projects)
      .set({ totalEscrowed: String(rows[0]?.total ?? 0) })
      .where(eq(projects.id, escrow.projectId))

    // Update milestone status
    const project = await this.db.query.projects.findFirst({
      where: eq(projects.id, escrow.projectId),
    })
    if (project) {
      const milestones = project.milestones as any[]
      if (milestones[escrow.milestoneIndex]) {
        milestones[escrow.milestoneIndex] = { ...milestones[escrow.milestoneIndex], status: 'funded' }
        await this.db
          .update(projects)
          .set({ milestones: JSON.stringify(milestones), updatedAt: new Date() })
          .where(eq(projects.id, escrow.projectId))
      }
    }
  }

  /**
   * Get escrow summary for a project (for trust indicator).
   */
  async getEscrowSummary(projectId: string) {
    const rows = await this.db.query.escrowTransactions.findMany({
      where: eq(escrowTransactions.projectId, projectId),
    })
    const held = rows.filter((r: any) => r.status === 'held').reduce((a: number, r: any) => a + Number(r.amount), 0)
    const released = rows.filter((r: any) => r.status === 'released').reduce((a: number, r: any) => a + Number(r.amount), 0)
    return { held, released, total: held + released }
  }
}
