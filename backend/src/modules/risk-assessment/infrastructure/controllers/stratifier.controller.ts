import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { SubmitStratificationDto } from '../../application/dto';
import {
  GetAssignedAssessmentsUseCase,
  GetRiskAssessmentUseCase,
  SubmitStratificationUseCase,
} from '../../application/use-cases';

interface CurrentRequestUser { id: string; userType: UserType }

@ApiTags('Risk Assessment')
@ApiBearerAuth()
@Controller('stratifier/assessments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.CEISH_MEMBER)
export class StratifierController {
  constructor(
    private readonly getAssignedAssessmentsUseCase: GetAssignedAssessmentsUseCase,
    private readonly getRiskAssessmentUseCase: GetRiskAssessmentUseCase,
    private readonly submitStratificationUseCase: SubmitStratificationUseCase,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Assigned assessments retrieved successfully' })
  async getAssigned(@CurrentUser() user: CurrentRequestUser) {
    return this.response(await this.getAssignedAssessmentsUseCase.execute(user.id));
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Risk assessment retrieved successfully' })
  async getOne(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string) {
    return this.response(await this.getRiskAssessmentUseCase.execute(id, user.id));
  }

  @Post(':id/submit')
  @ApiResponse({ status: 201, description: 'Stratification submitted successfully' })
  async submit(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string, @Body() data: SubmitStratificationDto) {
    return this.response(await this.submitStratificationUseCase.execute(user.id, user.userType, id, data));
  }

  private response<T>(data: T) {
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
