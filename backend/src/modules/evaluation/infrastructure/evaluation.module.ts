import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import {
  AddObservationUseCase,
  AssignEvaluatorsUseCase,
  CloseCorrectionUseCase,
  DeclareConflictUseCase,
  GetEvaluationProcessUseCase,
  GetEvaluatorAssignmentsUseCase,
  OpenCorrectionUseCase,
  SubmitCorrectionUseCase,
  SubmitEvaluationUseCase,
} from '../application/use-cases';
import { EVALUATION_REPOSITORY } from '../domain/repositories/evaluation.repository.interface';
import { EvaluationDomainService } from '../domain/services/evaluation-domain.service';
import { AdminEvaluationController, EvaluatorController } from './controllers';
import { EvaluationPrismaRepository } from './repositories';

@Module({
  imports: [AuthModule],
  controllers: [AdminEvaluationController, EvaluatorController],
  providers: [
    EvaluationDomainService,
    EvaluationPrismaRepository,
    { provide: EVALUATION_REPOSITORY, useExisting: EvaluationPrismaRepository },
    AssignEvaluatorsUseCase,
    DeclareConflictUseCase,
    SubmitEvaluationUseCase,
    AddObservationUseCase,
    OpenCorrectionUseCase,
    SubmitCorrectionUseCase,
    CloseCorrectionUseCase,
    GetEvaluationProcessUseCase,
    GetEvaluatorAssignmentsUseCase,
  ],
})
export class EvaluationModule {}
