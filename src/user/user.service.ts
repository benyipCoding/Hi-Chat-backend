import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/helpers';
import { Request } from 'express';

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

  async getFriendList(request: Request) {
    // const currentUser = request.user as User;
    // if (!currentUser.friend_ids) return null;
    // const result = await this.userRepository
    //   .createQueryBuilder('u')
    //   .select(['u.name', 'u.email', 'u.avatar'])
    //   .where('u.id IN (:...ids)', { ids: currentUser.friend_ids })
    //   .getMany();
    // return result;
  }

  async getStrangerList(request: Request) {
    const userId = (request.user as User).id;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return this.userRepository
      .createQueryBuilder('u')
      .where(`u.id NOT IN (:...ids) AND u.id != :current`, {
        ids: user?.friend_ids ? user.friend_ids.split(',') : ['1'],
        current: (request.user as User).id,
      })
      .getMany();
  }
}
