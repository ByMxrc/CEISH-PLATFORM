import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserAccountStatus } from '@common/enums';
import { AuthDomainService } from '../../domain/services/auth-domain.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { LoginDto, TokenResponseDto, UserInfoDto } from '../dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(data: LoginDto): Promise<TokenResponseDto> {
    const user = await this.userRepository.findByEmail(data.email.trim().toLowerCase());

    if (!user || !(await this.authDomainService.comparePassword(data.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    if (user.accountStatus !== UserAccountStatus.ACTIVE) {
      throw new ForbiddenException(this.getInactiveAccountMessage(user.accountStatus));
    }

    return this.createTokenResponse(user);
  }

  private async createTokenResponse(user: UserEntity): Promise<TokenResponseDto> {
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

  private getInactiveAccountMessage(status: UserAccountStatus): string {
    switch (status) {
      case UserAccountStatus.PENDING_APPROVAL:
        return 'Tu solicitud de cuenta está pendiente de aprobación por un administrador';
      case UserAccountStatus.REJECTED:
        return 'Tu solicitud de cuenta fue rechazada. Contacta al administrador para más información';
      case UserAccountStatus.SUSPENDED:
        return 'Tu cuenta está inactiva. Contacta al administrador';
      default:
        return 'Tu cuenta no está activa';
    }
  }
}
