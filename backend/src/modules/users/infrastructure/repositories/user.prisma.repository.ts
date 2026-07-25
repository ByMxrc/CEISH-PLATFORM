import { Injectable } from '@nestjs/common';
import { CeishMemberType, InvestigatorType, UserAccountStatus } from '@common/enums';
import { PrismaService } from '@common/prisma';
import {
  CeishMemberProfileEntity,
  InvestigatorProfileEntity,
  UserEntity,
} from '../../domain/entities/user.entity';
import {
  IUserRepository,
  UpdateUserProfileData,
  UserFilters,
} from '../../domain/repositories/user.repository.interface';

const profilesInclude = {
  investigatorProfile: true,
  ceishMemberProfile: true,
};

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: profilesInclude,
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: profilesInclude,
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  async findAll(filters: UserFilters): Promise<{ users: UserEntity[]; total: number }> {
    const where = {
      ...(filters.userType ? { userType: filters.userType as never } : {}),
      ...(filters.accountStatus ? { accountStatus: filters.accountStatus as never } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' as const } },
              { email: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const skip = (filters.page - 1) * filters.limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: profilesInclude,
        skip,
        take: filters.limit,
        orderBy: this.getOrderBy(filters),
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users: users.map(UserEntity.fromPrisma), total };
  }

  async updateStatus(id: string, status: UserAccountStatus): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { accountStatus: status as never },
      include: profilesInclude,
    });
    return UserEntity.fromPrisma(user);
  }

  async updateProfile(id: string, data: UpdateUserProfileData): Promise<UserEntity> {
    const { name, institution, department, phone } = data;
    const user = await this.prisma.$transaction(async (tx) => {
      if (name !== undefined) {
        await tx.user.update({ where: { id }, data: { name } });
      }

      await tx.investigatorProfile.update({
        where: { userId: id },
        data: { institution, department, phone },
      });

      return tx.user.findUniqueOrThrow({ where: { id }, include: profilesInclude });
    });
    return UserEntity.fromPrisma(user);
  }

  async updateInvestigatorProfile(
    id: string,
    data: UpdateUserProfileData,
  ): Promise<InvestigatorProfileEntity> {
    const profile = await this.prisma.investigatorProfile.update({
      where: { userId: id },
      data: {
        institution: data.institution,
        department: data.department,
        phone: data.phone,
        investigatorType: data.investigatorType as never,
      },
    });
    return profile as InvestigatorProfileEntity;
  }

  async updateCeishMemberProfile(
    id: string,
    data: UpdateUserProfileData,
  ): Promise<CeishMemberProfileEntity> {
    const profile = await this.prisma.ceishMemberProfile.update({
      where: { userId: id },
      data: {
        institution: data.institution,
        specialization: data.specialization,
        memberType: data.memberType as never,
      },
    });
    return profile as CeishMemberProfileEntity;
  }

  async findCeishMembers(type?: CeishMemberType): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: {
        userType: 'CEISH_MEMBER',
        ceishMemberProfile: type ? { is: { memberType: type as never } } : { isNot: null },
      },
      include: profilesInclude,
      orderBy: { name: 'asc' },
    });
    return users.map(UserEntity.fromPrisma);
  }

  private getOrderBy(filters: UserFilters) {
    const allowedSortFields = ['name', 'email', 'createdAt', 'accountStatus'];
    const sortBy = allowedSortFields.includes(filters.sortBy ?? '')
      ? filters.sortBy!
      : 'createdAt';
    return { [sortBy]: filters.sortOrder ?? 'asc' };
  }
}
