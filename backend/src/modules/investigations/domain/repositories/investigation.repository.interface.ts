import { InvestigationStatus } from '@common/enums';
import { InvestigationEntity } from '../entities/investigation.entity';
import { InvestigationParticipantEntity } from '../entities/investigation-participant.entity';

export interface CreateParticipantData {
  name: string;
  identification: string;
  email?: string;
  role?: string;
  institution?: string;
  isPrincipal: boolean;
}

export interface CreateInvestigationData {
  title: string;
  description?: string;
  researchTypeId: string;
  participants: CreateParticipantData[];
}

export interface InvestigationFilters {
  status?: InvestigationStatus;
  researchTypeId?: string;
  search?: string;
  createdById?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IInvestigationRepository {
  create(data: CreateInvestigationData, creatorId: string): Promise<InvestigationEntity>;
  findById(id: string): Promise<InvestigationEntity | null>;
  findAll(filters: InvestigationFilters): Promise<{ investigations: InvestigationEntity[]; total: number }>;
  findByCreator(creatorId: string): Promise<InvestigationEntity[]>;
  findByStatus(status: InvestigationStatus): Promise<InvestigationEntity[]>;
  updateStatus(id: string, status: InvestigationStatus, metadata?: unknown): Promise<InvestigationEntity>;
  updateCode(id: string, code: string): Promise<InvestigationEntity>;
  update(id: string, data: Partial<Pick<CreateInvestigationData, 'title' | 'description'>>): Promise<InvestigationEntity>;
  addParticipants(investigationId: string, participants: CreateParticipantData[]): Promise<void>;
  removeParticipant(participantId: string): Promise<void>;
  findParticipants(investigationId: string): Promise<InvestigationParticipantEntity[]>;
  generateCode(): Promise<string>;
}

export const INVESTIGATION_REPOSITORY = Symbol('IInvestigationRepository');
