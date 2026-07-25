import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigationStatus, RiskAssessmentStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { SubmitStratificationDto } from '../dto';
import { IRiskAssessmentRepository, RISK_ASSESSMENT_REPOSITORY } from '../../domain/repositories/risk-assessment.repository.interface';

@Injectable()
export class SubmitStratificationUseCase {
  constructor(
    @Inject(RISK_ASSESSMENT_REPOSITORY) private readonly riskAssessmentRepository: IRiskAssessmentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(memberId: string, memberType: UserType, assessmentId: string, data: SubmitStratificationDto) {
    if (memberType !== UserType.CEISH_MEMBER) throw new ForbiddenException('Only CEISH members can submit stratifications');
    const assessment = await this.riskAssessmentRepository.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Risk assessment not found');
    if (assessment.status !== RiskAssessmentStatus.ACTIVE) throw new ConflictException('Risk assessment is not active');
    if (!assessment.members?.some((member) => member.memberId === memberId)) {
      throw new ForbiddenException('You are not assigned to this risk assessment');
    }

    const completed = await this.riskAssessmentRepository.completeAssessment(assessment.id, data.riskLevel, data.justification);
    await this.prisma.investigation.update({
      where: { id: assessment.investigationId }, data: { status: InvestigationStatus.RISK_DEFINED as never },
    });
    await this.prisma.workflowEvent.createMany({
      data: [
        {
          eventType: 'STRATIFICATION_COMPLETED', actorId: memberId, investigationId: assessment.investigationId,
          entityType: 'risk_assessment', entityId: assessment.id,
          previousStatus: assessment.status, newStatus: completed.status,
          metadata: { riskLevel: data.riskLevel, justification: data.justification },
          description: 'Assigned CEISH member completed risk stratification',
        },
        {
          eventType: 'RISK_DEFINED', actorId: memberId, investigationId: assessment.investigationId,
          entityType: 'investigation', entityId: assessment.investigationId,
          newStatus: InvestigationStatus.RISK_DEFINED, metadata: { riskLevel: data.riskLevel },
          description: 'Risk level defined for investigation',
        },
      ],
    });
    return completed;
  }
}
