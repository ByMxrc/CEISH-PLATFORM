import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { UserAccountStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { UserEntity } from '../../domain/entities/user.entity';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { RegisterDto } from '../dto/register.dto';
import { EcuadorianIdentificationService } from '../../domain/services/ecuadorian-identification.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authDomainService: AuthDomainService,
    private readonly identificationService: EcuadorianIdentificationService,
  ) {}

  async execute(data: RegisterDto): Promise<UserEntity> {
    const email = data.email.trim().toLowerCase();
    const identificationNumber = this.identificationService.validate(data.identificationNumber);
    const institution = data.institution?.trim() || undefined;
    if (data.investigatorType === 'EXTERNAL' && !institution) {
      throw new BadRequestException('La institución es obligatoria para investigadores externos');
    }
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }
    const existingIdentification = await this.prisma.investigatorProfile.findUnique({
      where: { identificationNumber },
    });
    if (existingIdentification) {
      throw new ConflictException('An account with this identification number already exists');
    }

    const passwordHash = await this.authDomainService.hashPassword(data.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name.trim(),
          email,
          passwordHash,
          // El registro público está reservado exclusivamente a investigadores.
          userType: UserType.INVESTIGATOR,
          accountStatus: UserAccountStatus.PENDING_APPROVAL,
        },
      });

      await tx.investigatorProfile.create({
        data: {
          userId: createdUser.id,
          investigatorType: data.investigatorType,
          identificationNumber,
          identificationVerifiedAt: new Date(),
          institution,
        },
      });

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
