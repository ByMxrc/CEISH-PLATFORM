import { Injectable } from '@nestjs/common';
import { InvestigationStatus } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { InvestigationEntity } from '../../domain/entities/investigation.entity';
import { InvestigationParticipantEntity } from '../../domain/entities/investigation-participant.entity';
import {
  CreateInvestigationData,
  CreateParticipantData,
  IInvestigationRepository,
  InvestigationFilters,
} from '../../domain/repositories/investigation.repository.interface';

const detailsInclude = {
  participants: true,
  researchType: { select: { id: true, name: true, description: true } },
  createdBy: { select: { id: true, name: true, email: true } },
};

@Injectable()
export class InvestigationPrismaRepository implements IInvestigationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInvestigationData, creatorId: string): Promise<InvestigationEntity> {
    const investigation = await this.prisma.investigation.create({
      data: {
        title: data.title,
        description: data.description,
        researchTypeId: data.researchTypeId,
        createdById: creatorId,
        status: 'CREATED',
        participants: { create: data.participants },
      },
      include: detailsInclude,
    });
    return InvestigationEntity.fromPrisma(investigation);
  }

  async findById(id: string): Promise<InvestigationEntity | null> {
    const investigation = await this.prisma.investigation.findUnique({ where: { id }, include: detailsInclude });
    return investigation ? InvestigationEntity.fromPrisma(investigation) : null;
  }

  async findAll(filters: InvestigationFilters): Promise<{ investigations: InvestigationEntity[]; total: number }> {
    const where = {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.researchTypeId ? { researchTypeId: filters.researchTypeId } : {}),
      ...(filters.createdById ? { createdById: filters.createdById } : {}),
      ...(filters.search ? { title: { contains: filters.search, mode: 'insensitive' as const } } : {}),
    };
    const [investigations, total] = await this.prisma.$transaction([
      this.prisma.investigation.findMany({
        where,
        include: detailsInclude,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: this.getOrderBy(filters),
      }),
      this.prisma.investigation.count({ where }),
    ]);
    return { investigations: investigations.map(InvestigationEntity.fromPrisma), total };
  }

  async findByCreator(creatorId: string): Promise<InvestigationEntity[]> {
    const investigations = await this.prisma.investigation.findMany({
      where: { createdById: creatorId }, include: detailsInclude, orderBy: { createdAt: 'desc' },
    });
    return investigations.map(InvestigationEntity.fromPrisma);
  }

  async findByStatus(status: InvestigationStatus): Promise<InvestigationEntity[]> {
    const investigations = await this.prisma.investigation.findMany({
      where: { status: status as never }, include: detailsInclude, orderBy: { createdAt: 'desc' },
    });
    return investigations.map(InvestigationEntity.fromPrisma);
  }

  async updateStatus(id: string, status: InvestigationStatus, _metadata?: unknown): Promise<InvestigationEntity> {
    const investigation = await this.prisma.investigation.update({
      where: { id }, data: { status: status as never }, include: detailsInclude,
    });
    return InvestigationEntity.fromPrisma(investigation);
  }

  async updateCode(id: string, code: string): Promise<InvestigationEntity> {
    const investigation = await this.prisma.investigation.update({ where: { id }, data: { code }, include: detailsInclude });
    return InvestigationEntity.fromPrisma(investigation);
  }

  async update(id: string, data: Partial<Pick<CreateInvestigationData, 'title' | 'description'>>): Promise<InvestigationEntity> {
    const investigation = await this.prisma.investigation.update({
      where: { id }, data: { title: data.title, description: data.description }, include: detailsInclude,
    });
    return InvestigationEntity.fromPrisma(investigation);
  }

  async addParticipants(investigationId: string, participants: CreateParticipantData[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (participants.some((participant) => participant.isPrincipal)) {
        await tx.investigationParticipant.updateMany({ where: { investigationId }, data: { isPrincipal: false } });
      }
      await tx.investigationParticipant.createMany({ data: participants.map((participant) => ({ ...participant, investigationId })) });
    });
  }

  async removeParticipant(participantId: string): Promise<void> {
    await this.prisma.investigationParticipant.delete({ where: { id: participantId } });
  }

  async findParticipants(investigationId: string): Promise<InvestigationParticipantEntity[]> {
    const participants = await this.prisma.investigationParticipant.findMany({
      where: { investigationId }, orderBy: [{ isPrincipal: 'desc' }, { createdAt: 'asc' }],
    });
    return participants.map(InvestigationParticipantEntity.fromPrisma);
  }

  async generateCode(): Promise<string> {
    const investigations = await this.prisma.investigation.findMany({
      where: { code: { not: null } }, select: { code: true }, orderBy: { code: 'desc' },
    });
    const greatestNumber = investigations.reduce((maximum, investigation) => {
      const number = Number.parseInt(investigation.code?.replace(/^CEISH-/, '') ?? '', 10);
      return Number.isFinite(number) ? Math.max(maximum, number) : maximum;
    }, 0);
    return `CEISH-${String(greatestNumber + 1).padStart(3, '0')}`;
  }

  private getOrderBy(filters: InvestigationFilters) {
    const sortBy = ['title', 'status', 'createdAt', 'updatedAt', 'code'].includes(filters.sortBy ?? '')
      ? filters.sortBy!
      : 'createdAt';
    return { [sortBy]: filters.sortOrder ?? 'desc' };
  }
}
