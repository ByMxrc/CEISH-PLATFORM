import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserResponseDto } from '../dto';
import { IUserRepository, USERS_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserUseCase {
  constructor(@Inject(USERS_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return UserResponseDto.fromEntity(user);
  }
}
