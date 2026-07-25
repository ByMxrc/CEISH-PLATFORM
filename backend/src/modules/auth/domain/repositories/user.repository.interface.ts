import { UserEntity } from '../entities/user.entity';
import { UserType, InvestigatorType, CeishMemberType } from '@common/enums';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  userType: UserType;
  investigatorType?: InvestigatorType;
  memberType?: CeishMemberType;
  institution?: string;
  department?: string;
  specialization?: string;
  phone?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
