import { UserInfoDto } from './user-info.dto';

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserInfoDto;
}
