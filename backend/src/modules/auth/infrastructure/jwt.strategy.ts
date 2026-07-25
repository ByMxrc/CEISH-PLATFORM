import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserType } from '@common/enums';

interface AccessTokenPayload {
  sub: string;
  email: string;
  userType: UserType;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? '',
    });
  }

  validate(payload: AccessTokenPayload) {
    return { id: payload.sub, email: payload.email, userType: payload.userType };
  }
}
