import { UserAccountStatus, UserType } from '@common/enums';
import { UserEntity } from '../../domain/entities/user.entity';

export class UserInfoDto {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  accountStatus: UserAccountStatus;

  static fromEntity(user: UserEntity): UserInfoDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      accountStatus: user.accountStatus,
    };
  }
}
