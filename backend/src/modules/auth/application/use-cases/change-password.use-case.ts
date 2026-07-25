import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { ChangePasswordDto } from '../dto';
import { PrismaService } from '@common/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  userType: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(currentUser: AuthenticatedUser, data: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findById(currentUser.id);
    if (!user || !(await this.authDomainService.comparePassword(data.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await this.authDomainService.hashPassword(data.newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);
    await this.prisma.workflowEvent.create({
      data: {
        eventType: 'ADMIN_ACTION',
        actorId: user.id,
        entityType: 'user',
        entityId: user.id,
        description: 'User changed their password',
      },
    });

    return { message: 'Password changed successfully' };
  }
}
