import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserType } from '@common/enums';
import { QueryUsersDto, UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUsersUseCase {
  constructor(@Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(actorUserType: UserType, filters: QueryUsersDto) {
    if (actorUserType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can list users');
    }

    const { users, total } = await this.userRepository.findAll({
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    });

    return {
      users: users.map(UserResponseDto.fromEntity),
      pagination: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        total,
        totalPages: Math.ceil(total / (filters.limit ?? 10)),
      },
    };
  }
}
