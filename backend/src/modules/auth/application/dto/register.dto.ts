import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { InvestigatorType } from '@common/enums';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(InvestigatorType)
  investigatorType: InvestigatorType;
}
