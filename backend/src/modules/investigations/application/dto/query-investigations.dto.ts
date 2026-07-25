import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginatedQueryDto } from '@common/dto';
import { InvestigationStatus } from '@common/enums';

export class QueryInvestigationsDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(InvestigationStatus)
  status?: InvestigationStatus;

  @IsOptional()
  @IsString()
  researchTypeId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
