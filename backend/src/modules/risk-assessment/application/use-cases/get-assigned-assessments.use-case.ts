import { Inject, Injectable } from '@nestjs/common';
import { IRiskAssessmentRepository, RISK_ASSESSMENT_REPOSITORY } from '../../domain/repositories/risk-assessment.repository.interface';

@Injectable()
export class GetAssignedAssessmentsUseCase {
  constructor(@Inject(RISK_ASSESSMENT_REPOSITORY) private readonly riskAssessmentRepository: IRiskAssessmentRepository) {}

  execute(memberId: string) {
    return this.riskAssessmentRepository.findActiveByMember(memberId);
  }
}
