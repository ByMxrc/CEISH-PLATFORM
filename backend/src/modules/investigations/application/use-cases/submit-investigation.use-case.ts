import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigationStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { InvestigationDomainService } from '../../domain/services/investigation-domain.service';
import { IInvestigationRepository, INVESTIGATION_REPOSITORY } from '../../domain/repositories/investigation.repository.interface';

@Injectable()
export class SubmitInvestigationUseCase {
  constructor(
    @Inject(INVESTIGATION_REPOSITORY) private readonly investigationRepository: IInvestigationRepository,
    private readonly investigationDomainService: InvestigationDomainService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorType: UserType, investigationId: string) {
    if (actorType !== UserType.INVESTIGATOR) throw new ForbiddenException('Only investigators can submit investigations');
    const investigation = await this.investigationRepository.findById(investigationId);
    if (!investigation) throw new NotFoundException('Investigation not found');
    if (investigation.createdById !== actorId) throw new ForbiddenException('You cannot submit this investigation');
    if (!this.investigationDomainService.canTransition(investigation.status, InvestigationStatus.PENDING_ADMIN_REVIEW)) {
      throw new ConflictException('Investigation cannot be submitted in its current status');
    }

    const updated = await this.investigationRepository.updateStatus(investigation.id, InvestigationStatus.PENDING_ADMIN_REVIEW);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'INVESTIGATION_SUBMITTED', actorId, investigationId: investigation.id,
        entityType: 'investigation', entityId: investigation.id,
        previousStatus: investigation.status, newStatus: updated.status,
        description: 'Investigator submitted investigation for administrative review',
      },
    });
    return updated;
  }
}
