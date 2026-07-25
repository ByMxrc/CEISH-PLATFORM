import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRiskAssessmentRepository, RISK_ASSESSMENT_REPOSITORY } from '../../domain/repositories/risk-assessment.repository.interface';

@Injectable()
export class GetRiskAssessmentUseCase {
  constructor(@Inject(RISK_ASSESSMENT_REPOSITORY) private readonly riskAssessmentRepository: IRiskAssessmentRepository) {}

  async execute(assessmentId: string, assignedMemberId?: string) {
    const assessment = await this.riskAssessmentRepository.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Risk assessment not found');
    if (assignedMemberId && !assessment.members?.some((member) => member.memberId === assignedMemberId)) {
      throw new ForbiddenException('You are not assigned to this risk assessment');
    }
    return assessment;
  }

  async executeCurrent(investigationId: string) {
    const assessment = await this.riskAssessmentRepository.findActiveByInvestigation(investigationId);
    if (!assessment) throw new NotFoundException('Active risk assessment not found');
    return assessment;
  }
}
