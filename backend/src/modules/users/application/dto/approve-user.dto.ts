import { IsIn, IsOptional } from 'class-validator';
import { InvestigatorType } from '@common/enums';

export class ApproveUserDto {
  @IsOptional()
  @IsIn([InvestigatorType.INTERNAL, InvestigatorType.EXTERNAL])
  investigatorType?: InvestigatorType;
}
