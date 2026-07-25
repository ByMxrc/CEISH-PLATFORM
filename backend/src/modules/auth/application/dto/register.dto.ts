import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { InvestigatorType, UserType } from '@common/enums';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserType)
  userType: UserType;

  @IsOptional()
  @IsEnum(InvestigatorType)
  investigatorType?: InvestigatorType;
}
