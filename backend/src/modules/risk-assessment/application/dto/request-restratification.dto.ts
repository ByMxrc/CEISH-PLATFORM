import { IsString, MinLength } from 'class-validator';

export class RequestRestratificationDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
