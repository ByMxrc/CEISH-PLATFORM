import { IsString, MinLength } from 'class-validator';

export class RejectUserDto {
  @IsString()
  @MinLength(10)
  reason: string;
}
