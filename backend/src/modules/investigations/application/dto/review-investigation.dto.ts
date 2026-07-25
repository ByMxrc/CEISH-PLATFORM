import { IsIn, IsString, MinLength } from 'class-validator';

export class ReviewInvestigationDto {
  @IsIn(['APPROVE', 'REJECT'])
  action: 'APPROVE' | 'REJECT';

  @IsString()
  @MinLength(10)
  reason: string;
}
