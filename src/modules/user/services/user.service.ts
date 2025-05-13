import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { UserRepositoryInterface } from '../interfaces/user-repository.interface';
import { User } from '../entities/user.entity';
import { hash } from 'bcrypt';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import {
  ERROR_MESSAGES,
  REPOSITORY_TOKENS,
} from 'src/shared/constants/constants';

@Injectable()
export class UserService {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (userExists)
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);

    const user = new User();
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    user.password = await hash(createUserDto.password, 10);

    return this.userRepository.create(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: Partial<User> = {};
    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.password)
      updateData.password = await hash(updateUserDto.password, 10);
    return this.userRepository.update(id, updateData);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
