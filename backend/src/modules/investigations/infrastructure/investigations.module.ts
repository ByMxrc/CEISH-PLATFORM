import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import {
  AddParticipantUseCase,
  CreateInvestigationUseCase,
  GetInvestigationParticipantsUseCase,
  GetInvestigationUseCase,
  GetInvestigationsUseCase,
  RemoveParticipantUseCase,
  ReviewInvestigationUseCase,
  SubmitInvestigationUseCase,
  UpdateInvestigationUseCase,
} from '../application/use-cases';
import { INVESTIGATION_REPOSITORY } from '../domain/repositories/investigation.repository.interface';
import { InvestigationDomainService } from '../domain/services/investigation-domain.service';
import { AdminInvestigationController, InvestigatorInvestigationController } from './controllers';
import { InvestigationPrismaRepository } from './repositories';

@Module({
  imports: [AuthModule],
  controllers: [InvestigatorInvestigationController, AdminInvestigationController],
  providers: [
    InvestigationDomainService,
    CreateInvestigationUseCase,
    GetInvestigationsUseCase,
    GetInvestigationUseCase,
    UpdateInvestigationUseCase,
    SubmitInvestigationUseCase,
    ReviewInvestigationUseCase,
    AddParticipantUseCase,
    RemoveParticipantUseCase,
    GetInvestigationParticipantsUseCase,
    InvestigationPrismaRepository,
    { provide: INVESTIGATION_REPOSITORY, useExisting: InvestigationPrismaRepository },
  ],
  exports: [INVESTIGATION_REPOSITORY, InvestigationDomainService],
})
export class InvestigationsModule {}
