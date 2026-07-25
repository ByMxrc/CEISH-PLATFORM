import { Inject, Injectable } from '@nestjs/common';
import { IRiskAssessmentRepository, RISK_ASSESSMENT_REPOSITORY } from '../../domain/repositories/risk-assessment.repository.interface';

@Injectable()
export class GetAssessmentHistoryUseCase {
  constructor(@Inject(RISK_ASSESSMENT_REPOSITORY) private readonly riskAssessmentRepository: IRiskAssessmentRepository) {}

  execute(investigationId: string) {
    return this.riskAssessmentRepository.findHistoryByInvestigation(investigationId);
  }
}
