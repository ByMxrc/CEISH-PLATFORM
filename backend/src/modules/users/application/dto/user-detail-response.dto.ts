import { WorkflowEventType } from '@prisma/client';
import { UserResponseDto } from './user-response.dto';

export class AccountHistoryEntryDto {
  eventType: WorkflowEventType;
  previousStatus: string | null;
  newStatus: string | null;
  reason: string | null;
  description: string | null;
  occurredAt: Date;
}

export class UserDetailResponseDto extends UserResponseDto {
  accountHistory: AccountHistoryEntryDto[];
}
