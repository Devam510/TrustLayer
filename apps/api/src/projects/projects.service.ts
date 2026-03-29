import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import { eq, and, isNull } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { DATABASE_TOKEN } from '../database/database.module'
import { projects, subscriptions, planLimits } from '@trustlayer/db'
import { CreateProjectDto, UpdateProjectDto } from './projects.dto'

@Injectable()
export class ProjectsService {
  constructor(@Inject(DATABASE_TOKEN) private readonly db: any) {}

  async create(orgId: string, freelancerId: string, dto: CreateProjectDto) {
    // Enforce max_projects limit for the org's plan
    await this.enforcePlanLimit(orgId)

    const inviteToken = randomBytes(16).toString('hex')
    const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const [project] = await this.db
      .insert(projects)
      .values({
        orgId,
        freelancerId,
        title: dto.title,
        description: dto.description,
        budget: dto.budget,
        currency: dto.currency ?? 'USD',
        countryCode: dto.countryCode ?? 'US',
        bufferPct: dto.bufferPct ?? '10.00',
        milestones: dto.milestones ?? [],
        inviteToken,
        inviteTokenExpiresAt,
        status: 'draft',
      })
      .returning()

    return project
  }

  async findAll(orgId: string) {
    return this.db.query.projects.findMany({
      where: and(eq(projects.orgId, orgId), isNull(projects.deletedAt)),
    })
  }

  async findOne(id: string, orgId: string) {
    const project = await this.db.query.projects.findFirst({
      where: and(eq(projects.id, id), isNull(projects.deletedAt)),
    })
    if (!project) throw new NotFoundException('Project not found')
    if (project.orgId !== orgId) throw new ForbiddenException()
    return project
  }

  async update(id: string, orgId: string, dto: UpdateProjectDto) {
    await this.findOne(id, orgId)
    const [updated] = await this.db
      .update(projects)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()
    return updated
  }

  async softDelete(id: string, orgId: string) {
    await this.findOne(id, orgId)
    await this.db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(eq(projects.id, id))
    return { deleted: true }
  }

  async resendInvite(id: string, orgId: string) {
    await this.findOne(id, orgId)
    const inviteToken = randomBytes(16).toString('hex')
    const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const [updated] = await this.db
      .update(projects)
      .set({ inviteToken, inviteTokenExpiresAt, inviteTokenUsed: false, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning()
    return updated
  }

  async validateInviteToken(token: string) {
    const project = await this.db.query.projects.findFirst({
      where: and(
        eq(projects.inviteToken, token),
        isNull(projects.deletedAt),
      ),
    })
    if (!project) throw new NotFoundException('Invalid invite token')
    if (project.inviteTokenUsed) throw new ForbiddenException('Invite already used')
    if (project.inviteTokenExpiresAt && project.inviteTokenExpiresAt < new Date()) {
      throw new ForbiddenException('Invite token expired')
    }
    return project
  }

  async acceptInvite(token: string, clientId: string) {
    const project = await this.validateInviteToken(token)
    const [updated] = await this.db
      .update(projects)
      .set({
        clientId,
        inviteTokenUsed: true,
        status: 'pending_verification',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project.id))
      .returning()
    return updated
  }

  private async enforcePlanLimit(orgId: string) {
    const sub = await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.orgId, orgId),
    })
    const plan = sub?.plan ?? 'free'
    const limits = await this.db.query.planLimits.findFirst({
      where: eq(planLimits.plan, plan),
    })
    if (!limits?.maxProjects) return // null = unlimited

    const count = await this.db.query.projects.findMany({
      where: and(eq(projects.orgId, orgId), isNull(projects.deletedAt)),
    })
    if (count.length >= limits.maxProjects) {
      throw new ForbiddenException(
        `${plan} plan allows max ${limits.maxProjects} project(s). Please upgrade.`,
      )
    }
  }
}
