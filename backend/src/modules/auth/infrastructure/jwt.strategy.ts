import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserAccountStatus, UserType } from '@common/enums';
import { IUserRepository, USER_REPOSITORY } from '../domain/repositories/user.repository.interface';

interface AccessTokenPayload {
  sub: string;
  email: string;
  userType: UserType;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  async validate(payload: AccessTokenPayload) {
    const user = await this.userRepository.findById(payload.sub);

    if (!user || user.accountStatus !== UserAccountStatus.ACTIVE) {
      throw new UnauthorizedException('La sesión no es válida para una cuenta inactiva');
    }

    return { id: user.id, email: user.email, userType: user.userType };
  }
}
