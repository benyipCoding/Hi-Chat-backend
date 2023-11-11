import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/helpers';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        {
          email: createUserDto.email,
        },
        { name: createUserDto.userName },
      ],
    });
    if (existingUser)
      throw new HttpException('User is already existed!', HttpStatus.CONFLICT);
    const hashedPassword = await hashPassword(createUserDto.password);
    const payload = {
      ...createUserDto,
      name: createUserDto.userName,
      password: hashedPassword,
    };
    const newUser = await this.userRepository.create(payload);
    return this.userRepository.save(newUser);
  }
}
