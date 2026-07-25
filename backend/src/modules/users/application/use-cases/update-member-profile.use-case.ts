import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { UpdateMemberProfileDto, UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateMemberProfileUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    actorId: string,
    actorUserType: UserType,
    userId: string,
    data: UpdateMemberProfileDto,
  ): Promise<UserResponseDto> {
    if (actorUserType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can update member profiles');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.ceishMemberProfile) throw new NotFoundException('CEISH member profile not found');

    await this.userRepository.updateCeishMemberProfile(user.id, data);
    const updatedUser = await this.userRepository.findById(user.id);
    if (!updatedUser) throw new NotFoundException('User not found');

    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'ADMIN_ACTION',
        actorId,
        entityType: 'ceish_member_profile',
        entityId: user.ceishMemberProfile.id,
        description: 'Administrator updated CEISH member profile',
      },
    });

    return UserResponseDto.fromEntity(updatedUser);
  }
}
