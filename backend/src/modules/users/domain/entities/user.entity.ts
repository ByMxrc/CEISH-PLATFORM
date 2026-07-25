import {
  UserType,
  UserAccountStatus,
  InvestigatorType,
  CeishMemberType,
} from '@common/enums';

export interface InvestigatorProfileEntity {
  id: string;
  userId: string;
  investigatorType: InvestigatorType;
  institution: string | null;
  department: string | null;
  phone: string | null;
  createdAt: Date;
}

export interface CeishMemberProfileEntity {
  id: string;
  userId: string;
  memberType: CeishMemberType;
  specialization: string | null;
  institution: string | null;
  phone: string | null;
  createdAt: Date;
}

interface PrismaUserData {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  accountStatus: UserAccountStatus;
  createdAt: Date;
  updatedAt: Date;
  investigatorProfile?: InvestigatorProfileEntity | null;
  ceishMemberProfile?: CeishMemberProfileEntity | null;
}

export class UserEntity {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  accountStatus: UserAccountStatus;
  createdAt: Date;
  updatedAt: Date;
  investigatorProfile?: InvestigatorProfileEntity | null;
  ceishMemberProfile?: CeishMemberProfileEntity | null;

  static fromPrisma(prismaData: PrismaUserData): UserEntity {
    return Object.assign(new UserEntity(), prismaData);
  }
}
