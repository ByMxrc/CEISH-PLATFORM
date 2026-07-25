export class InvestigationParticipantEntity {
  id: string;
  investigationId: string;
  name: string;
  identification: string;
  email: string | null;
  role: string | null;
  institution: string | null;
  isPrincipal: boolean;

  static fromPrisma(data: InvestigationParticipantEntity): InvestigationParticipantEntity {
    return Object.assign(new InvestigationParticipantEntity(), data);
  }
}
