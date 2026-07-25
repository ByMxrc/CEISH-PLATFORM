import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigationStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { ReviewInvestigationDto } from '../dto';
import { InvestigationDomainService } from '../../domain/services/investigation-domain.service';
import { IInvestigationRepository, INVESTIGATION_REPOSITORY } from '../../domain/repositories/investigation.repository.interface';

@Injectable()
export class ReviewInvestigationUseCase {
  constructor(
    @Inject(INVESTIGATION_REPOSITORY) private readonly investigationRepository: IInvestigationRepository,
    private readonly investigationDomainService: InvestigationDomainService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorType: UserType, investigationId: string, data: ReviewInvestigationDto) {
    if (actorType !== UserType.ADMIN) throw new ForbiddenException('Only administrators can review investigations');
    const investigation = await this.investigationRepository.findById(investigationId);
    if (!investigation) throw new NotFoundException('Investigation not found');

    const nextStatus = data.action === 'APPROVE' ? InvestigationStatus.APPROVED : InvestigationStatus.REJECTED;
    if (!this.investigationDomainService.canTransition(investigation.status, nextStatus)) {
      throw new ConflictException('Investigation cannot be reviewed in its current status');
    }

    let updated = await this.investigationRepository.updateStatus(investigation.id, nextStatus);
    if (data.action === 'APPROVE') {
      const code = await this.investigationRepository.generateCode();
      updated = await this.investigationRepository.updateCode(investigation.id, code);
    }

    await this.prisma.workflowEvent.create({
      data: {
        eventType: data.action === 'APPROVE' ? 'INVESTIGATION_APPROVED' : 'INVESTIGATION_REJECTED',
        actorId, investigationId: investigation.id, entityType: 'investigation', entityId: investigation.id,
        previousStatus: investigation.status, newStatus: nextStatus,
        metadata: data.action === 'REJECT' ? { reason: data.reason } : { code: updated.code },
        description: `Administrator ${data.action === 'APPROVE' ? 'approved' : 'rejected'} investigation`,
      },
    });
    return updated;
  }
}
