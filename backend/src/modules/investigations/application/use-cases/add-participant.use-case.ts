import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigationStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { AddParticipantDto } from '../dto';
import { IInvestigationRepository, INVESTIGATION_REPOSITORY } from '../../domain/repositories/investigation.repository.interface';

@Injectable()
export class AddParticipantUseCase {
  constructor(
    @Inject(INVESTIGATION_REPOSITORY) private readonly investigationRepository: IInvestigationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorType: UserType, investigationId: string, data: AddParticipantDto): Promise<void> {
    if (actorType !== UserType.INVESTIGATOR) throw new ForbiddenException('Only investigators can add participants');
    const investigation = await this.investigationRepository.findById(investigationId);
    if (!investigation) throw new NotFoundException('Investigation not found');
    if (investigation.createdById !== actorId) throw new ForbiddenException('You cannot modify this investigation');
    if (investigation.status !== InvestigationStatus.CREATED) throw new ConflictException('Participants can only be changed while the investigation is a draft');

    const participants = investigation.participants ?? [];
    if (participants.length >= 20) throw new ConflictException('An investigation can have at most 20 participants');
    await this.investigationRepository.addParticipants(investigation.id, [data]);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'ADMIN_ACTION', actorId, investigationId: investigation.id,
        entityType: 'investigation_participant', description: 'Investigator added a participant',
      },
    });
  }
}
