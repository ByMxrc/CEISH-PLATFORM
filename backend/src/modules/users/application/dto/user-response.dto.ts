import {
  CeishMemberType,
  InvestigatorType,
  UserAccountStatus,
  UserType,
} from '@common/enums';
import { UserEntity } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  accountStatus: UserAccountStatus;
  createdAt: Date;
  investigatorProfile?: {
    investigatorType: InvestigatorType;
    institution: string | null;
    department: string | null;
    phone: string | null;
  } | null;
  ceishMemberProfile?: {
    memberType: CeishMemberType;
    specialization: string | null;
    institution: string | null;
    phone: string | null;
  } | null;

  static fromEntity(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      investigatorProfile: user.investigatorProfile
        ? {
            investigatorType: user.investigatorProfile.investigatorType,
            institution: user.investigatorProfile.institution,
            department: user.investigatorProfile.department,
            phone: user.investigatorProfile.phone,
          }
        : null,
      ceishMemberProfile: user.ceishMemberProfile
        ? {
            memberType: user.ceishMemberProfile.memberType,
            specialization: user.ceishMemberProfile.specialization,
            institution: user.ceishMemberProfile.institution,
            phone: user.ceishMemberProfile.phone,
          }
        : null,
    };
  }
}
