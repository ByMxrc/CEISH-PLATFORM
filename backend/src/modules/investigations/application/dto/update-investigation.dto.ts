import { IsOptional, IsString } from 'class-validator';

export class UpdateInvestigationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
