import { IsIn, IsOptional, IsString } from 'class-validator';
import { InvestigatorType } from '@common/enums';

export class ApproveUserDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsIn([InvestigatorType.INTERNAL, InvestigatorType.EXTERNAL])
  investigatorType?: InvestigatorType;
}
