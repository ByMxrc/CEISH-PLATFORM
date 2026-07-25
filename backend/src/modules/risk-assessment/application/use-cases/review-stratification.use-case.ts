import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigationStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { ReviewStratificationDto } from '../dto';
import { IRiskAssessmentRepository, RISK_ASSESSMENT_REPOSITORY } from '../../domain/repositories/risk-assessment.repository.interface';

@Injectable()
export class ReviewStratificationUseCase {
  constructor(
    @Inject(RISK_ASSESSMENT_REPOSITORY) private readonly riskAssessmentRepository: IRiskAssessmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(adminId: string, adminType: UserType, assessmentId: string, data: ReviewStratificationDto) {
    if (adminType !== UserType.ADMIN) throw new ForbiddenException('Only administrators can review stratifications');
    const assessment = await this.riskAssessmentRepository.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Risk assessment not found');
    const investigation = await this.prisma.investigation.findUnique({ where: { id: assessment.investigationId } });
    if (!investigation) throw new NotFoundException('Investigation not found');
    if (investigation.status !== InvestigationStatus.RISK_DEFINED) {
      throw new ConflictException('Investigation is not ready for stratification review');
    }
    if (data.action === 'RESTRATIFY' && !data.reason) {
      throw new ConflictException('A reason is required to request restratification');
    }

    const nextStatus = data.action === 'APPROVE'
      ? InvestigationStatus.WAITING_EVALUATORS
      : InvestigationStatus.RESTRATIFICATION;
    if (data.action === 'RESTRATIFY') {
      await this.riskAssessmentRepository.markReplaced(assessment.id);
    }
    await this.prisma.investigation.update({ where: { id: investigation.id }, data: { status: nextStatus as never } });
    await this.prisma.workflowEvent.create({
      data: {
        eventType: data.action === 'APPROVE' ? 'ADMIN_ACTION' : 'REESTRATIFICATION_REQUESTED',
        actorId: adminId, investigationId: investigation.id,
        entityType: 'risk_assessment', entityId: assessment.id,
        previousStatus: investigation.status, newStatus: nextStatus,
        metadata: data.action === 'RESTRATIFY' ? { reason: data.reason } : { riskLevel: assessment.riskLevel },
        description: data.action === 'APPROVE' ? 'Administrator approved risk stratification' : 'Administrator requested restratification',
      },
    });
    return {
      ...assessment,
      status: data.action === 'RESTRATIFY' ? 'REPLACED' : assessment.status,
      nextInvestigationStatus: nextStatus,
    };
  }
}
