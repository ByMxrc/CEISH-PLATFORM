import { IsIn, IsString, MinLength } from 'class-validator';
import { RiskLevel } from '@common/enums';

export class SubmitStratificationDto {
  @IsIn([RiskLevel.NO_RISK, RiskLevel.MINIMUM_RISK, RiskLevel.GREATER_THAN_MINIMUM_RISK])
  riskLevel: RiskLevel;

  @IsString()
  @MinLength(10)
  justification: string;
}
