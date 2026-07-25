import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import {
  AssignStratifiersUseCase,
  CreateRiskAssessmentUseCase,
  GetAssignedAssessmentsUseCase,
  GetAssessmentHistoryUseCase,
  GetRiskAssessmentUseCase,
  ReviewStratificationUseCase,
  SubmitStratificationUseCase,
} from '../application/use-cases';
import { RISK_ASSESSMENT_REPOSITORY } from '../domain/repositories/risk-assessment.repository.interface';
import { RiskAssessmentDomainService } from '../domain/services/risk-assessment-domain.service';
import { AdminStratificationController, StratifierController } from './controllers';
import { RiskAssessmentPrismaRepository } from './repositories';

@Module({
  imports: [AuthModule],
  controllers: [AdminStratificationController, StratifierController],
  providers: [
    RiskAssessmentDomainService,
    CreateRiskAssessmentUseCase,
    AssignStratifiersUseCase,
    SubmitStratificationUseCase,
    ReviewStratificationUseCase,
    GetRiskAssessmentUseCase,
    GetAssessmentHistoryUseCase,
    GetAssignedAssessmentsUseCase,
    RiskAssessmentPrismaRepository,
    { provide: RISK_ASSESSMENT_REPOSITORY, useExisting: RiskAssessmentPrismaRepository },
  ],
  exports: [RISK_ASSESSMENT_REPOSITORY, RiskAssessmentDomainService],
})
export class RiskAssessmentModule {}
