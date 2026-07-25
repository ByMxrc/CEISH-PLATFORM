import { Injectable } from '@nestjs/common';
@Injectable()
export class UserDomainService {
  isEligibleForEvaluator(
    userIdentification: string,
    investigationParticipants: { identification: string }[],
  ): boolean {
    return !investigationParticipants.some(
      (participant) => participant.identification === userIdentification,
    );
  }
}
