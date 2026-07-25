import { Inject, Injectable } from '@nestjs/common';
import { CeishMemberType } from '@common/enums';
import { UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetMembersUseCase {
  constructor(@Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(memberType?: CeishMemberType): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findCeishMembers(memberType);
    return users.map(UserResponseDto.fromEntity);
  }
}
