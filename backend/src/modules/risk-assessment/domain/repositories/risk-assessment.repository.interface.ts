import { RiskAssessmentStatus, RiskLevel } from '@common/enums';
import { RiskAssessmentEntity } from '../entities/risk-assessment.entity';
import { RiskAssessmentMemberEntity } from '../entities/risk-assessment-member.entity';

export interface IRiskAssessmentRepository {
  create(investigationId: string, createdByAdminId: string): Promise<RiskAssessmentEntity>;
  findById(id: string): Promise<RiskAssessmentEntity | null>;
  findActiveByInvestigation(investigationId: string): Promise<RiskAssessmentEntity | null>;
  findHistoryByInvestigation(investigationId: string): Promise<RiskAssessmentEntity[]>;
  findActiveByMember(memberId: string): Promise<RiskAssessmentEntity[]>;
  assignMember(riskAssessmentId: string, memberId: string): Promise<RiskAssessmentMemberEntity>;
  removeMember(riskAssessmentId: string, memberId: string): Promise<void>;
  completeAssessment(id: string, riskLevel: RiskLevel, justification: string): Promise<RiskAssessmentEntity>;
  markReplaced(id: string, replacedById?: string): Promise<void>;
}

export const RISK_ASSESSMENT_REPOSITORY = Symbol('IRiskAssessmentRepository');
