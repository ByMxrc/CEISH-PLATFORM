import { InvestigationStatus } from '@common/enums';
import { InvestigationParticipantEntity } from './investigation-participant.entity';

interface PrismaInvestigationData {
  id: string;
  code: string | null;
  title: string;
  description: string | null;
  status: InvestigationStatus;
  researchTypeId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: InvestigationParticipantEntity[];
  researchType?: { id: string; name: string; description: string | null };
  createdBy?: { id: string; name: string; email: string };
}

export class InvestigationEntity {
  id: string;
  code: string | null;
  title: string;
  description: string | null;
  status: InvestigationStatus;
  researchTypeId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  participants?: InvestigationParticipantEntity[];
  researchType?: { id: string; name: string; description: string | null };
  createdBy?: { id: string; name: string; email: string };

  static fromPrisma(data: PrismaInvestigationData): InvestigationEntity {
    return Object.assign(new InvestigationEntity(), {
      ...data,
      participants: data.participants?.map(InvestigationParticipantEntity.fromPrisma),
    });
  }
}
