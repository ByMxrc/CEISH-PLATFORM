import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
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

  @IsString()
  @Matches(/^\d{10}$/, { message: 'identificationNumber must contain exactly 10 digits' })
  identificationNumber: string;

  @IsEnum(InvestigatorType)
  investigatorType: InvestigatorType;

  @ValidateIf((data: RegisterDto) => data.investigatorType === InvestigatorType.EXTERNAL)
  @IsString()
  @IsNotEmpty({ message: 'institution is required for external investigators' })
  institution?: string;
}
