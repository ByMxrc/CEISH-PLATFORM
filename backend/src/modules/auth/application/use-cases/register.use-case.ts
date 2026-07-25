import { ConflictException, Injectable } from '@nestjs/common';
import { CeishMemberType, InvestigatorType, UserAccountStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authDomainService: AuthDomainService,
  ) {}

  async execute(data: RegisterDto): Promise<UserEntity> {
    const email = data.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await this.authDomainService.hashPassword(data.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name.trim(),
          email,
          passwordHash,
          userType: data.userType,
          accountStatus: UserAccountStatus.PENDING_APPROVAL,
        },
      });

      if (data.userType === UserType.INVESTIGATOR) {
        await tx.investigatorProfile.create({
          data: {
            userId: createdUser.id,
            investigatorType: data.investigatorType ?? InvestigatorType.INTERNAL,
          },
        });
      }

      if (data.userType === UserType.CEISH_MEMBER) {
        await tx.ceishMemberProfile.create({
          data: {
            userId: createdUser.id,
            memberType: CeishMemberType.INTERNAL,
          },
        });
      }

      await tx.workflowEvent.create({
        data: {
          eventType: 'USER_REGISTERED',
          actorId: createdUser.id,
          entityType: 'user',
          entityId: createdUser.id,
          newStatus: UserAccountStatus.PENDING_APPROVAL,
          description: 'User account registration requested',
        },
      });

      return createdUser;
    });

    return UserEntity.fromPrisma(user);
  }
}
