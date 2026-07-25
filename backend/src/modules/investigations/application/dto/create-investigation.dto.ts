import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParticipantDto {
  @IsString()
  name: string;

  @IsString()
  @MinLength(5)
  identification: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsBoolean()
  isPrincipal: boolean;
}

@ValidatorConstraint({ name: 'isValidPrincipalCount', async: false })
export class IsValidPrincipalCountConstraint implements ValidatorConstraintInterface {
  validate(participants: CreateParticipantDto[]): boolean {
    return Array.isArray(participants) && participants.filter((participant) => participant.isPrincipal).length === 1;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must contain exactly one principal participant`;
  }
}

export class CreateInvestigationDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  researchTypeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParticipantDto)
  @Validate(IsValidPrincipalCountConstraint)
  participants: CreateParticipantDto[];
}
