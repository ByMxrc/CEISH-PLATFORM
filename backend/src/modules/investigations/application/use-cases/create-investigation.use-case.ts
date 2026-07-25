import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InvestigationStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { CreateInvestigationDto } from '../dto';
import { InvestigationEntity } from '../../domain/entities/investigation.entity';
import { IInvestigationRepository, INVESTIGATION_REPOSITORY } from '../../domain/repositories/investigation.repository.interface';

@Injectable()
export class CreateInvestigationUseCase {
  constructor(
    @Inject(INVESTIGATION_REPOSITORY) private readonly investigationRepository: IInvestigationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(creatorId: string, creatorType: UserType, data: CreateInvestigationDto): Promise<InvestigationEntity> {
    if (creatorType !== UserType.INVESTIGATOR) {
      throw new ForbiddenException('Only investigators can create investigations');
    }
    if (data.participants.filter((participant) => participant.isPrincipal).length !== 1) {
      throw new ForbiddenException('An investigation must have exactly one principal participant');
    }

    const investigation = await this.investigationRepository.create(data, creatorId);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'INVESTIGATION_CREATED',
        actorId: creatorId,
        investigationId: investigation.id,
        entityType: 'investigation',
        entityId: investigation.id,
        newStatus: InvestigationStatus.CREATED,
        description: 'Investigator created a draft investigation',
      },
    });
    return investigation;
  }
}
