import { Injectable } from '@nestjs/common';
import { CeishMemberType, InvestigatorType, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  IUserRepository,
} from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          userType: data.userType,
        },
      });

      if (data.userType === UserType.INVESTIGATOR) {
        await tx.investigatorProfile.create({
          data: {
            userId: createdUser.id,
            investigatorType: data.investigatorType ?? InvestigatorType.INTERNAL,
            institution: data.institution,
            department: data.department,
            phone: data.phone,
          },
        });
      }

      if (data.userType === UserType.CEISH_MEMBER) {
        await tx.ceishMemberProfile.create({
          data: {
            userId: createdUser.id,
            memberType: data.memberType ?? CeishMemberType.INTERNAL,
            institution: data.institution,
            specialization: data.specialization,
            phone: data.phone,
          },
        });
      }

      return createdUser;
    });

    return UserEntity.fromPrisma(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}
