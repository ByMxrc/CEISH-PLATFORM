export class RiskAssessmentMemberEntity {
  id: string;
  riskAssessmentId: string;
  memberId: string;
  assignedAt: Date;
  member?: {
    id: string;
    name: string;
    email: string;
    ceishMemberProfile?: { memberType: string } | null;
  };

  static fromPrisma(data: RiskAssessmentMemberEntity): RiskAssessmentMemberEntity {
    return Object.assign(new RiskAssessmentMemberEntity(), data);
  }
}
