import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAccountStatus } from '@common/enums';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { RefreshTokenDto, TokenResponseDto, UserInfoDto } from '../dto';

interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(data: RefreshTokenDto): Promise<TokenResponseDto> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(data.refreshToken, {
        secret: this.getRequiredEnvironmentValue('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');
    if (user.accountStatus !== UserAccountStatus.ACTIVE) {
      throw new ForbiddenException('Your account is not active');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, userType: user.userType },
      { secret: this.getRequiredEnvironmentValue('JWT_SECRET'), expiresIn: process.env.JWT_EXPIRATION ?? '15m' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.getRequiredEnvironmentValue('JWT_REFRESH_SECRET'),
        expiresIn: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
      },
    );

    return { accessToken, refreshToken, user: UserInfoDto.fromEntity(user) };
  }

  private getRequiredEnvironmentValue(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`${name} must be configured`);
    return value;
  }
}
