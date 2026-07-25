import { IsString, MinLength } from 'class-validator';

export class RejectUserDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(10)
  reason: string;
}
