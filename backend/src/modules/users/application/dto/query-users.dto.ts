import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginatedQueryDto } from '@common/dto';
import { UserAccountStatus, UserType } from '@common/enums';

export class QueryUsersDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @IsOptional()
  @IsEnum(UserAccountStatus)
  accountStatus?: UserAccountStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
