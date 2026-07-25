import { Injectable } from '@nestjs/common';
import { RiskAssessmentStatus, RiskLevel } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { RiskAssessmentEntity } from '../../domain/entities/risk-assessment.entity';
import { RiskAssessmentMemberEntity } from '../../domain/entities/risk-assessment-member.entity';
import { IRiskAssessmentRepository } from '../../domain/repositories/risk-assessment.repository.interface';

const detailsInclude = {
  members: {
    include: {
      member: {
        select: {
          id: true, name: true, email: true,
          ceishMemberProfile: { select: { memberType: true } },
        },
      },
    },
  },
  investigation: {
    select: {
      id: true, status: true,
      participants: { select: { id: true, identification: true } },
    },
  },
};

@Injectable()
export class RiskAssessmentPrismaRepository implements IRiskAssessmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(investigationId: string, createdByAdminId: string): Promise<RiskAssessmentEntity> {
    const assessment = await this.prisma.riskAssessment.create({
      data: { investigationId, createdById: createdByAdminId, status: RiskAssessmentStatus.ACTIVE as never },
      include: detailsInclude,
    });
    return RiskAssessmentEntity.fromPrisma(assessment);
  }

  async findById(id: string): Promise<RiskAssessmentEntity | null> {
    const assessment = await this.prisma.riskAssessment.findUnique({ where: { id }, include: detailsInclude });
    return assessment ? RiskAssessmentEntity.fromPrisma(assessment) : null;
  }

  async findActiveByInvestigation(investigationId: string): Promise<RiskAssessmentEntity | null> {
    const assessment = await this.prisma.riskAssessment.findFirst({
      where: { investigationId, status: RiskAssessmentStatus.ACTIVE as never },
      include: detailsInclude, orderBy: { createdAt: 'desc' },
    });
    return assessment ? RiskAssessmentEntity.fromPrisma(assessment) : null;
  }

  async findHistoryByInvestigation(investigationId: string): Promise<RiskAssessmentEntity[]> {
    const assessments = await this.prisma.riskAssessment.findMany({
      where: { investigationId }, include: detailsInclude, orderBy: { createdAt: 'desc' },
    });
    return assessments.map(RiskAssessmentEntity.fromPrisma);
  }

  async findActiveByMember(memberId: string): Promise<RiskAssessmentEntity[]> {
    const assessments = await this.prisma.riskAssessment.findMany({
      where: {
        status: RiskAssessmentStatus.ACTIVE as never,
        members: { some: { memberId } },
      },
      include: detailsInclude,
      orderBy: { createdAt: 'desc' },
    });
    return assessments.map(RiskAssessmentEntity.fromPrisma);
  }

  async assignMember(riskAssessmentId: string, memberId: string): Promise<RiskAssessmentMemberEntity> {
    const member = await this.prisma.riskAssessmentMember.create({
      data: { riskAssessmentId, memberId },
      include: { member: { select: { id: true, name: true, email: true, ceishMemberProfile: { select: { memberType: true } } } } },
    });
    return RiskAssessmentMemberEntity.fromPrisma(member);
  }

  async removeMember(riskAssessmentId: string, memberId: string): Promise<void> {
    await this.prisma.riskAssessmentMember.delete({
      where: { riskAssessmentId_memberId: { riskAssessmentId, memberId } },
    });
  }

  async completeAssessment(id: string, riskLevel: RiskLevel, justification: string): Promise<RiskAssessmentEntity> {
    const assessment = await this.prisma.riskAssessment.update({
      where: { id },
      data: {
        status: RiskAssessmentStatus.COMPLETED as never,
        riskLevel: riskLevel as never,
        justification,
        completedAt: new Date(),
      },
      include: detailsInclude,
    });
    return RiskAssessmentEntity.fromPrisma(assessment);
  }

  async markReplaced(id: string, replacedById?: string): Promise<void> {
    await this.prisma.riskAssessment.update({
      where: { id },
      data: {
        status: RiskAssessmentStatus.REPLACED as never,
        ...(replacedById ? { replacedById } : {}),
      },
    });
  }
}
