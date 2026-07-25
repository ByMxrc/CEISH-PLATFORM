import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators';
import { UpdateProfileDto } from '../../application/dto';
import { GetUserUseCase, UpdateProfileUseCase } from '../../application/use-cases';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get('me')
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully' })
  async getMe(@CurrentUser() currentUser: { id: string }) {
    return this.response(await this.getUserUseCase.execute(currentUser.id));
  }

  @Put('me/profile')
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMyProfile(@CurrentUser() currentUser: { id: string }, @Body() data: UpdateProfileDto) {
    return this.response(await this.updateProfileUseCase.execute(currentUser.id, data));
  }

  private response<T>(data: T) {
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
