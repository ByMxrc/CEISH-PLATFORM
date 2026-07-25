import { Injectable } from '@nestjs/common';
import { CeishMemberType, RiskLevel, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';

@Injectable()
export class RiskAssessmentDomainService {
  constructor(private readonly prisma: PrismaService) {}

  async getEligibleStratifiers(excludeUserIds: string[]) {
    return this.prisma.user.findMany({
      where: {
        userType: UserType.CEISH_MEMBER as never,
        accountStatus: 'ACTIVE',
        id: { notIn: excludeUserIds },
        ceishMemberProfile: { is: { memberType: CeishMemberType.INTERNAL as never } },
      },
      include: { ceishMemberProfile: true },
    });
  }

  async isUserParticipant(userId: string, investigationId: string): Promise<boolean> {
    const participant = await this.prisma.investigationParticipant.findFirst({
      where: { investigationId, identification: userId },
      select: { id: true },
    });
    return Boolean(participant);
  }

  getEvaluatorCountForRiskLevel(riskLevel: RiskLevel): number {
    return riskLevel === RiskLevel.NO_RISK ? 1 : 2;
  }

  validateNoRiskWithEvaluatorCount(riskLevel: RiskLevel, evaluatorCount: number): boolean {
    return riskLevel !== RiskLevel.NO_RISK || evaluatorCount === 1;
  }
}
