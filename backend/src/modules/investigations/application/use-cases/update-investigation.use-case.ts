import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigationStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { UpdateInvestigationDto } from '../dto';
import { IInvestigationRepository, INVESTIGATION_REPOSITORY } from '../../domain/repositories/investigation.repository.interface';

@Injectable()
export class UpdateInvestigationUseCase {
  constructor(
    @Inject(INVESTIGATION_REPOSITORY) private readonly investigationRepository: IInvestigationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorType: UserType, investigationId: string, data: UpdateInvestigationDto) {
    if (actorType !== UserType.INVESTIGATOR) throw new ForbiddenException('Only investigators can update investigations');
    const investigation = await this.investigationRepository.findById(investigationId);
    if (!investigation) throw new NotFoundException('Investigation not found');
    if (investigation.createdById !== actorId) throw new ForbiddenException('You cannot update this investigation');
    if (investigation.status !== InvestigationStatus.CREATED) throw new ConflictException('Only draft investigations can be updated');

    const updated = await this.investigationRepository.update(investigation.id, data);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'ADMIN_ACTION', actorId, investigationId: investigation.id,
        entityType: 'investigation', entityId: investigation.id,
        description: 'Investigator updated draft investigation',
      },
    });
    return updated;
  }
}
