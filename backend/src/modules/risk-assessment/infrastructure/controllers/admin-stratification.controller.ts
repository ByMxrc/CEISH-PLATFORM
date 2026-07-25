import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import {
  AssignStratifiersDto,
  CreateRiskAssessmentDto,
  ReviewStratificationDto,
} from '../../application/dto';
import {
  AssignStratifiersUseCase,
  CreateRiskAssessmentUseCase,
  GetAssessmentHistoryUseCase,
  GetRiskAssessmentUseCase,
  ReviewStratificationUseCase,
} from '../../application/use-cases';

interface CurrentRequestUser { id: string; userType: UserType }

@ApiTags('Risk Assessment')
@ApiBearerAuth()
@Controller('admin/stratification')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.ADMIN)
export class AdminStratificationController {
  constructor(
    private readonly createRiskAssessmentUseCase: CreateRiskAssessmentUseCase,
    private readonly getAssessmentHistoryUseCase: GetAssessmentHistoryUseCase,
    private readonly getRiskAssessmentUseCase: GetRiskAssessmentUseCase,
    private readonly assignStratifiersUseCase: AssignStratifiersUseCase,
    private readonly reviewStratificationUseCase: ReviewStratificationUseCase,
  ) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Risk assessment created successfully' })
  async create(@CurrentUser() user: CurrentRequestUser, @Body() data: CreateRiskAssessmentDto) {
    return this.response(await this.createRiskAssessmentUseCase.execute(user.id, user.userType, data));
  }

  @Get('investigation/:investigationId/history')
  @ApiResponse({ status: 200, description: 'Assessment history retrieved successfully' })
  async history(@Param('investigationId') investigationId: string) {
    return this.response(await this.getAssessmentHistoryUseCase.execute(investigationId));
  }

  @Get('investigation/:investigationId/current')
  @ApiResponse({ status: 200, description: 'Current assessment retrieved successfully' })
  async current(@Param('investigationId') investigationId: string) {
    return this.response(await this.getRiskAssessmentUseCase.executeCurrent(investigationId));
  }

  @Post(':id/stratifiers')
  @ApiResponse({ status: 201, description: 'Stratifiers assigned successfully' })
  async assign(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string, @Body() data: AssignStratifiersDto) {
    await this.assignStratifiersUseCase.execute(user.id, user.userType, id, data);
    return this.response({ message: 'Stratifiers assigned successfully' });
  }

  @Post(':id/review')
  @ApiResponse({ status: 201, description: 'Stratification reviewed successfully' })
  async review(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string, @Body() data: ReviewStratificationDto) {
    return this.response(await this.reviewStratificationUseCase.execute(user.id, user.userType, id, data));
  }

  private response<T>(data: T) {
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
