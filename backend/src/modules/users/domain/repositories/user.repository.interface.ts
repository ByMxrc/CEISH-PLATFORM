import {
  UserEntity,
  InvestigatorProfileEntity,
  CeishMemberProfileEntity,
} from '../entities/user.entity';
import {
  UserAccountStatus,
  InvestigatorType,
  CeishMemberType,
  UserType,
} from '@common/enums';

export interface UserFilters {
  userType?: UserType;
  accountStatus?: UserAccountStatus;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FindUsersResult {
  users: UserEntity[];
  total: number;
}

export interface UpdateUserProfileData {
  name?: string;
  institution?: string;
  department?: string;
  phone?: string;
  specialization?: string;
  investigatorType?: InvestigatorType;
  memberType?: CeishMemberType;
}

export interface IUserRepository {
  findAll(filters: UserFilters): Promise<FindUsersResult>;

  findById(id: string): Promise<UserEntity | null>;

  findByEmail(email: string): Promise<UserEntity | null>;

  updateStatus(
    id: string,
    status: UserAccountStatus,
  ): Promise<UserEntity>;

  updateProfile(id: string, data: UpdateUserProfileData): Promise<UserEntity>;

  updateInvestigatorProfile(
    id: string,
    data: UpdateUserProfileData,
  ): Promise<InvestigatorProfileEntity>;

  updateCeishMemberProfile(
    id: string,
    data: UpdateUserProfileData,
  ): Promise<CeishMemberProfileEntity>;

  findCeishMembers(type?: CeishMemberType): Promise<UserEntity[]>;
}

export const USERS_REPOSITORY = Symbol('UsersIUserRepository');
