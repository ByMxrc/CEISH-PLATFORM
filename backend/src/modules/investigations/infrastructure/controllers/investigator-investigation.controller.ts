import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import {
  AddParticipantDto,
  CreateInvestigationDto,
  QueryInvestigationsDto,
  UpdateInvestigationDto,
} from '../../application/dto';
import {
  AddParticipantUseCase,
  CreateInvestigationUseCase,
  GetInvestigationParticipantsUseCase,
  GetInvestigationUseCase,
  GetInvestigationsUseCase,
  RemoveParticipantUseCase,
  SubmitInvestigationUseCase,
  UpdateInvestigationUseCase,
} from '../../application/use-cases';

interface CurrentRequestUser { id: string; userType: UserType }

@ApiTags('Investigations')
@ApiBearerAuth()
@Controller('investigator/investigations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserType.INVESTIGATOR)
export class InvestigatorInvestigationController {
  constructor(
    private readonly getInvestigationsUseCase: GetInvestigationsUseCase,
    private readonly createInvestigationUseCase: CreateInvestigationUseCase,
    private readonly getInvestigationUseCase: GetInvestigationUseCase,
    private readonly updateInvestigationUseCase: UpdateInvestigationUseCase,
    private readonly submitInvestigationUseCase: SubmitInvestigationUseCase,
    private readonly getParticipantsUseCase: GetInvestigationParticipantsUseCase,
    private readonly addParticipantUseCase: AddParticipantUseCase,
    private readonly removeParticipantUseCase: RemoveParticipantUseCase,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Investigations retrieved successfully' })
  async getAll(@CurrentUser() user: CurrentRequestUser, @Query() query: QueryInvestigationsDto) {
    return this.response(await this.getInvestigationsUseCase.execute(user.id, user.userType, query));
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Investigation created successfully' })
  async create(@CurrentUser() user: CurrentRequestUser, @Body() data: CreateInvestigationDto) {
    return this.response(await this.createInvestigationUseCase.execute(user.id, user.userType, data));
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Investigation retrieved successfully' })
  async getOne(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string) {
    return this.response(await this.getInvestigationUseCase.execute(user.id, user.userType, id));
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Investigation updated successfully' })
  async update(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string, @Body() data: UpdateInvestigationDto) {
    return this.response(await this.updateInvestigationUseCase.execute(user.id, user.userType, id, data));
  }

  @Post(':id/submit')
  @ApiResponse({ status: 201, description: 'Investigation submitted successfully' })
  async submit(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string) {
    return this.response(await this.submitInvestigationUseCase.execute(user.id, user.userType, id));
  }

  @Get(':id/participants')
  @ApiResponse({ status: 200, description: 'Participants retrieved successfully' })
  async getParticipants(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string) {
    return this.response(await this.getParticipantsUseCase.execute(user.id, user.userType, id));
  }

  @Post(':id/participants')
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  async addParticipant(@CurrentUser() user: CurrentRequestUser, @Param('id') id: string, @Body() data: AddParticipantDto) {
    await this.addParticipantUseCase.execute(user.id, user.userType, id, data);
    return this.response({ message: 'Participant added successfully' });
  }

  @Delete(':id/participants/:participantId')
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  async removeParticipant(
    @CurrentUser() user: CurrentRequestUser,
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    await this.removeParticipantUseCase.execute(user.id, user.userType, id, participantId);
    return this.response({ message: 'Participant removed successfully' });
  }

  private response<T>(data: T) {
    return { success: true, data, timestamp: new Date().toISOString() };
  }
}
