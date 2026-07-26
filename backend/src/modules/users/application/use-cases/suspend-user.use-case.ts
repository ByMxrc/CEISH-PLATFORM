import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserAccountStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { SuspendUserDto, UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class SuspendUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorUserType: UserType, data: SuspendUserDto & { userId: string }): Promise<UserResponseDto> {
    if (actorUserType !== UserType.ADMIN) throw new ForbiddenException('Only administrators can suspend users');

    const user = await this.userRepository.findById(data.userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.accountStatus !== UserAccountStatus.ACTIVE) {
      throw new ConflictException('Only active accounts can be suspended');
    }

    const updatedUser = await this.userRepository.updateStatus(user.id, UserAccountStatus.SUSPENDED);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'ADMIN_ACTION',
        actorId,
        entityType: 'user',
        entityId: user.id,
        previousStatus: user.accountStatus,
        newStatus: UserAccountStatus.SUSPENDED,
        metadata: { reason: data.reason },
        description: 'Administrator suspended user account',
      },
    });

    return UserResponseDto.fromEntity(updatedUser);
  }
}
