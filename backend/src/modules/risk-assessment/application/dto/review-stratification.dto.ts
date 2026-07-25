import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ReviewStratificationDto {
  @IsIn(['APPROVE', 'RESTRATIFY'])
  action: 'APPROVE' | 'RESTRATIFY';

  @IsOptional()
  @IsString()
  @MinLength(10)
  reason?: string;
}
