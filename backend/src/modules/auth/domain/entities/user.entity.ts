import { User } from '@prisma/client';
import { UserType, UserAccountStatus } from '@common/enums';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  userType: UserType;
  accountStatus: UserAccountStatus;
  createdAt: Date;
  updatedAt: Date;

  static fromPrisma(prismaUser: User): UserEntity {
    const entity = new UserEntity();
    entity.id = prismaUser.id;
    entity.name = prismaUser.name;
    entity.email = prismaUser.email;
    entity.passwordHash = prismaUser.passwordHash;
    entity.userType = prismaUser.userType as UserType;
    entity.accountStatus = prismaUser.accountStatus as UserAccountStatus;
    entity.createdAt = prismaUser.createdAt;
    entity.updatedAt = prismaUser.updatedAt;

    return entity;
  }

  toSafeUser() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      userType: this.userType,
      accountStatus: this.accountStatus,
    };
  }
}
