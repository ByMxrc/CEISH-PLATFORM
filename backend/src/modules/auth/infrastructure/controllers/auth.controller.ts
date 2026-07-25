import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators';
import {
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from '../../application/dto';
import {
  AuthenticatedUser,
  ChangePasswordUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  RegisterUseCase,
} from '../../application/use-cases';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'Account registration requested' })
  async register(@Body() data: RegisterDto, @Req() request: { url: string }) {
    const user = await this.registerUseCase.execute(data);
    return this.response(user.toSafeUser(), request.url);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Authenticated successfully' })
  async login(@Body() data: LoginDto, @Req() request: { url: string }) {
    return this.response(await this.loginUseCase.execute(data), request.url);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  async refresh(@Body() data: RefreshTokenDto, @Req() request: { url: string }) {
    return this.response(await this.refreshTokenUseCase.execute(data), request.url);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Password changed successfully' })
  async changePassword(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() data: ChangePasswordDto,
    @Req() request: { url: string },
  ) {
    return this.response(
      await this.changePasswordUseCase.execute(currentUser, data),
      request.url,
    );
  }

  private response<T>(data: T, path: string) {
    return { success: true, data, timestamp: new Date().toISOString(), path };
  }
}
