import { Injectable } from '@nestjs/common';
import { InvestigationStatus } from '@common/enums';
import { CreateParticipantData } from '../repositories/investigation.repository.interface';

@Injectable()
export class InvestigationDomainService {
  private readonly validTransitions: Record<InvestigationStatus, InvestigationStatus[]> = {
    CREATED: [InvestigationStatus.PENDING_ADMIN_REVIEW],
    PENDING_ADMIN_REVIEW: [InvestigationStatus.APPROVED, InvestigationStatus.REJECTED],
    REJECTED: [],
    APPROVED: [InvestigationStatus.WAITING_STRATIFICATION],
    WAITING_STRATIFICATION: [InvestigationStatus.STRATIFICATION],
    STRATIFICATION: [InvestigationStatus.RISK_DEFINED],
    RISK_DEFINED: [InvestigationStatus.ADMIN_RISK_REVIEW],
    ADMIN_RISK_REVIEW: [InvestigationStatus.WAITING_EVALUATORS, InvestigationStatus.RESTRATIFICATION],
    RESTRATIFICATION: [InvestigationStatus.STRATIFICATION],
    WAITING_EVALUATORS: [InvestigationStatus.WAITING_CONFLICT_CHECK],
    WAITING_CONFLICT_CHECK: [InvestigationStatus.UNDER_EVALUATION],
    UNDER_EVALUATION: [InvestigationStatus.WAITING_RESEARCHER_RESPONSE, InvestigationStatus.FINAL_REVIEW],
    WAITING_RESEARCHER_RESPONSE: [InvestigationStatus.UNDER_EVALUATION, InvestigationStatus.FINAL_REVIEW],
    FINAL_REVIEW: [InvestigationStatus.COMPLETED, InvestigationStatus.CANCELLED],
    COMPLETED: [],
    CANCELLED: [],
  };

  canTransition(current: InvestigationStatus, next: InvestigationStatus): boolean {
    return this.validTransitions[current].includes(next);
  }

  validateParticipants(participants: CreateParticipantData[]): boolean {
    return participants.filter((participant) => participant.isPrincipal).length >= 1;
  }
}
