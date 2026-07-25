import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators';
import { CeishMemberType, UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { GetMembersUseCase } from '../../application/use-cases';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('members')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.ADMIN)
export class MemberController {
  constructor(private readonly getMembersUseCase: GetMembersUseCase) {}

  @Get()
  @ApiResponse({ status: 200, description: 'CEISH members retrieved successfully' })
  async getMembers(@Query('memberType') memberType?: CeishMemberType) {
    return {
      success: true,
      data: await this.getMembersUseCase.execute(memberType),
      timestamp: new Date().toISOString(),
    };
  }
}
