import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserAccountStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { RejectUserDto, UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class RejectUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorUserType: UserType, data: RejectUserDto & { userId: string }): Promise<UserResponseDto> {
    if (actorUserType !== UserType.ADMIN) throw new ForbiddenException('Only administrators can reject users');

    const user = await this.userRepository.findById(data.userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.accountStatus !== UserAccountStatus.PENDING_APPROVAL) {
      throw new ConflictException('Only pending accounts can be rejected');
    }

    const updatedUser = await this.userRepository.updateStatus(user.id, UserAccountStatus.REJECTED);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'USER_REJECTED',
        actorId,
        entityType: 'user',
        entityId: user.id,
        previousStatus: user.accountStatus,
        newStatus: UserAccountStatus.REJECTED,
        metadata: { reason: data.reason },
        description: 'Administrator rejected user account',
      },
    });

    return UserResponseDto.fromEntity(updatedUser);
  }
}
