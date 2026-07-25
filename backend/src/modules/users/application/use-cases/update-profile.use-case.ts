import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma';
import { UpdateProfileDto, UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(currentUserId: string, data: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(currentUserId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.investigatorProfile) {
      throw new ForbiddenException('Only investigators can update this profile');
    }

    const updatedUser = await this.userRepository.updateProfile(user.id, data);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'ADMIN_ACTION',
        actorId: user.id,
        entityType: 'user',
        entityId: user.id,
        description: 'Investigator updated their profile',
      },
    });

    return UserResponseDto.fromEntity(updatedUser);
  }
}
