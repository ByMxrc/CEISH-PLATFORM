import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  ChangePasswordUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
} from '../application/use-cases';
import { EcuadorianIdentificationService } from '../domain/services/ecuadorian-identification.service';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { AuthDomainService } from '../domain/services/auth-domain.service';
import { AuthController } from './controllers';
import { JwtStrategy } from './jwt.strategy';
import { UserPrismaRepository } from './repositories';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: process.env.JWT_EXPIRATION ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthDomainService,
    RegisterUseCase,
    EcuadorianIdentificationService,
    LoginUseCase,
    RefreshTokenUseCase,
    ChangePasswordUseCase,
    UserPrismaRepository,
    { provide: USER_REPOSITORY, useExisting: UserPrismaRepository },
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule, USER_REPOSITORY],
})
export class AuthModule {}
