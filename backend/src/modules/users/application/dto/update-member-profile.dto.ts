import { IsIn, IsOptional, IsString } from 'class-validator';
import { CeishMemberType } from '@common/enums';

export class UpdateMemberProfileDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsIn([CeishMemberType.INTERNAL, CeishMemberType.EXTERNAL])
  memberType?: CeishMemberType;
}
