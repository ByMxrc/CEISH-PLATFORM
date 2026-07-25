import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { QueryInvestigationsDto, ReviewInvestigationDto } from '../../application/dto';
import { GetInvestigationUseCase, GetInvestigationsUseCase, ReviewInvestigationUseCase } from '../../application/use-cases';

interface CurrentRequestUser { id: string; userType: UserType }

@ApiTags('Investigations')
@ApiBearerAuth()
@Controller('admin/investigations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.ADMIN)
export class AdminInvestigationController {
  constructor(
    private readonly getInvestigationsUseCase: GetInvestigationsUseCase,
    private readonly getInvestigationUseCase: GetInvestigationUseCase,
    private readonly reviewInvestigationUseCase: ReviewInvestigationUseCase,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Investigations retrieved successfully' })
  async getAll(@CurrentUser() user: CurrentRequestUser, @Query() query: QueryInvestigationsDto) {
    return this.response(await this.getInvestigationsUseCase.execute(user.id, user.userType, query));
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Investigation retrieved successfully' })
  async getOne(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string) {
    return this.response(await this.getInvestigationUseCase.execute(user.id, user.userType, id));
  }

  @Post(':id/review')
  @ApiResponse({ status: 201, description: 'Investigation reviewed successfully' })
  async review(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string, @Body() data: ReviewInvestigationDto) {
    return this.response(await this.reviewInvestigationUseCase.execute(user.id, user.userType, id, data));
  }

  private response<T>(data: T) {
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
