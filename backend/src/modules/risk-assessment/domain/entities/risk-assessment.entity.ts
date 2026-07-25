import { RiskAssessmentStatus, RiskLevel } from '@common/enums';
import { RiskAssessmentMemberEntity } from './risk-assessment-member.entity';

interface PrismaRiskAssessmentData {
  id: string;
  investigationId: string;
  status: RiskAssessmentStatus;
  riskLevel: RiskLevel | null;
  justification: string | null;
  createdById: string;
  replacedById: string | null;
  createdAt: Date;
  completedAt: Date | null;
  members?: RiskAssessmentMemberEntity[];
  investigation?: { id: string; status: string; participants?: { id: string; identification: string }[] };
}

export class RiskAssessmentEntity {
  id: string;
  investigationId: string;
  status: RiskAssessmentStatus;
  riskLevel: RiskLevel | null;
  justification: string | null;
  createdById: string;
  replacedById: string | null;
  createdAt: Date;
  completedAt: Date | null;
  members?: RiskAssessmentMemberEntity[];
  investigation?: { id: string; status: string; participants?: { id: string; identification: string }[] };

  static fromPrisma(data: PrismaRiskAssessmentData): RiskAssessmentEntity {
    return Object.assign(new RiskAssessmentEntity(), {
      ...data,
      members: data.members?.map(RiskAssessmentMemberEntity.fromPrisma),
    });
  }
}
