import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CeishMemberType, RiskAssessmentStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { AssignStratifiersDto } from '../dto';
import { RiskAssessmentDomainService } from '../../domain/services/risk-assessment-domain.service';
import { IRiskAssessmentRepository, RISK_ASSESSMENT_REPOSITORY } from '../../domain/repositories/risk-assessment.repository.interface';

@Injectable()
export class AssignStratifiersUseCase {
  constructor(
    @Inject(RISK_ASSESSMENT_REPOSITORY) private readonly riskAssessmentRepository: IRiskAssessmentRepository,
    private readonly riskAssessmentDomainService: RiskAssessmentDomainService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(adminId: string, adminType: UserType, assessmentId: string, data: AssignStratifiersDto): Promise<void> {
    if (adminType !== UserType.ADMIN) throw new ForbiddenException('Only administrators can assign stratifiers');
    if (new Set(data.memberIds).size !== data.memberIds.length) throw new ConflictException('A member can only be assigned once');
    const assessment = await this.riskAssessmentRepository.findById(assessmentId);
    if (!assessment) throw new NotFoundException('Risk assessment not found');
    if (assessment.status !== RiskAssessmentStatus.ACTIVE) throw new ConflictException('Risk assessment is not active');

    for (const memberId of data.memberIds) {
      const member = await this.prisma.user.findUnique({
        where: { id: memberId }, include: { ceishMemberProfile: true },
      });
      if (!member || member.userType !== UserType.CEISH_MEMBER || member.ceishMemberProfile?.memberType !== CeishMemberType.INTERNAL) {
        throw new ConflictException('Stratifiers must be internal CEISH members');
      }
      if (await this.riskAssessmentDomainService.isUserParticipant(memberId, assessment.investigationId)) {
        throw new ConflictException('A research participant cannot stratify the same investigation');
      }
      await this.riskAssessmentRepository.assignMember(assessment.id, member.id);
      await this.prisma.workflowEvent.create({
        data: {
          eventType: 'EVALUATOR_ASSIGNED', actorId: adminId, investigationId: assessment.investigationId,
          entityType: 'risk_assessment_member', metadata: { memberId: member.id, memberName: member.name },
          description: 'Administrator assigned stratifier',
        },
      });
    }
  }
}
