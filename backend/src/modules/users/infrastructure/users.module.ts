import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import {
  ApproveUserUseCase,
  GetMembersUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  RejectUserUseCase,
  SuspendUserUseCase,
  UpdateMemberProfileUseCase,
  UpdateProfileUseCase,
} from '../application/use-cases';
import { USERS_REPOSITORY } from '../domain/repositories/user.repository.interface';
import { UserDomainService } from '../domain/services/user-domain.service';
import {
  AdminUserController,
  MemberController,
  UserController,
} from './controllers';
import { UserPrismaRepository } from './repositories';

@Module({
  imports: [AuthModule],
  controllers: [AdminUserController, UserController, MemberController],
  providers: [
    UserDomainService,
    GetUsersUseCase,
    GetUserUseCase,
    ApproveUserUseCase,
    RejectUserUseCase,
    SuspendUserUseCase,
    UpdateProfileUseCase,
    UpdateMemberProfileUseCase,
    GetMembersUseCase,
    UserPrismaRepository,
    { provide: USERS_REPOSITORY, useExisting: UserPrismaRepository },
  ],
  exports: [USERS_REPOSITORY, UserDomainService],
})
export class UsersModule {}
