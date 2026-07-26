import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { UserType } from '@common/enums';
import {
  ApproveUserDto,
  QueryUsersDto,
  RejectUserDto,
  SuspendUserDto,
  UpdateMemberProfileDto,
} from '../../application/dto';
import {
  ApproveUserUseCase,
  GetAdminUserDetailUseCase,
  GetUsersUseCase,
  RejectUserUseCase,
  SuspendUserUseCase,
  UpdateMemberProfileUseCase,
} from '../../application/use-cases';

interface CurrentRequestUser {
  id: string;
  userType: UserType;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.ADMIN)
export class AdminUserController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getAdminUserDetailUseCase: GetAdminUserDetailUseCase,
    private readonly approveUserUseCase: ApproveUserUseCase,
    private readonly rejectUserUseCase: RejectUserUseCase,
    private readonly suspendUserUseCase: SuspendUserUseCase,
    private readonly updateMemberProfileUseCase: UpdateMemberProfileUseCase,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@CurrentUser() currentUser: CurrentRequestUser, @Query() query: QueryUsersDto) {
    return this.response(await this.getUsersUseCase.execute(currentUser.userType, query));
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUser(@Param('id') id: string) {
    return this.response(await this.getAdminUserDetailUseCase.execute(id));
  }

  @Post(':id/approve')
  @ApiResponse({ status: 201, description: 'User approved successfully' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentRequestUser,
    @Body() data: ApproveUserDto,
  ) {
    return this.response(
      await this.approveUserUseCase.execute(currentUser.id, currentUser.userType, {
        ...data,
        userId: id,
      }),
    );
  }

  @Post(':id/reject')
  @ApiResponse({ status: 201, description: 'User rejected successfully' })
  async reject(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentRequestUser,
    @Body() data: RejectUserDto,
  ) {
    return this.response(
      await this.rejectUserUseCase.execute(currentUser.id, currentUser.userType, {
        ...data,
        userId: id,
      }),
    );
  }

  @Post(':id/suspend')
  @ApiResponse({ status: 201, description: 'User suspended successfully' })
  async suspend(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentRequestUser,
    @Body() data: SuspendUserDto,
  ) {
    return this.response(
      await this.suspendUserUseCase.execute(currentUser.id, currentUser.userType, {
        ...data,
        userId: id,
      }),
    );
  }

  @Put(':id/profile')
  @ApiResponse({ status: 200, description: 'Member profile updated successfully' })
  async updateMemberProfile(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentRequestUser,
    @Body() data: UpdateMemberProfileDto,
  ) {
    return this.response(
      await this.updateMemberProfileUseCase.execute(currentUser.id, currentUser.userType, id, data),
    );
  }

  private response<T>(data: T) {
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
