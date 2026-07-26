import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowEventType } from '@prisma/client';
import { PrismaService } from '@common/prisma';
import { UserDetailResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetAdminUserDetailUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<UserDetailResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const events = await this.prisma.workflowEvent.findMany({
      where: {
        entityType: 'user',
        entityId: id,
        OR: [
          { eventType: { in: [WorkflowEventType.USER_REGISTERED, WorkflowEventType.USER_APPROVED, WorkflowEventType.USER_REJECTED] } },
          { eventType: WorkflowEventType.ADMIN_ACTION, newStatus: { not: null } },
        ],
      },
      orderBy: { occurredAt: 'desc' },
    });

    return {
      ...UserDetailResponseDto.fromEntity(user),
      accountHistory: events.map((event) => ({
        eventType: event.eventType,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        reason: this.getReason(event.metadata),
        description: event.description,
        occurredAt: event.occurredAt,
      })),
    };
  }

  private getReason(metadata: unknown): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
    const reason = (metadata as Record<string, unknown>).reason;
    return typeof reason === 'string' ? reason : null;
  }
}
