import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserAccountStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { ApproveUserDto, UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class ApproveUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(actorId: string, actorUserType: UserType, data: ApproveUserDto): Promise<UserResponseDto> {
    if (actorUserType !== UserType.ADMIN) throw new ForbiddenException('Only administrators can approve users');

    const user = await this.userRepository.findById(data.userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.accountStatus !== UserAccountStatus.PENDING_APPROVAL) {
      throw new ConflictException('Only pending accounts can be approved');
    }

    if (user.userType === UserType.INVESTIGATOR && data.investigatorType) {
      await this.userRepository.updateInvestigatorProfile(user.id, {
        investigatorType: data.investigatorType,
      });
    }

    const updatedUser = await this.userRepository.updateStatus(user.id, UserAccountStatus.ACTIVE);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'USER_APPROVED',
        actorId,
        entityType: 'user',
        entityId: user.id,
        previousStatus: user.accountStatus,
        newStatus: UserAccountStatus.ACTIVE,
        description: 'Administrator approved user account',
      },
    });

    return UserResponseDto.fromEntity(updatedUser);
  }
}
