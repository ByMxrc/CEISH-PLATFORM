import { IsString } from 'class-validator';

export class CreateRiskAssessmentDto {
  @IsString()
  investigationId: string;
}
