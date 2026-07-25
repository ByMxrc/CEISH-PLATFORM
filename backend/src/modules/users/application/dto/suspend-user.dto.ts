import { IsString } from 'class-validator';

export class SuspendUserDto {
  @IsString()
  userId: string;

  @IsString()
  reason: string;
}
