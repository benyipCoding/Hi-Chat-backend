import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/helpers';
import { Request } from 'express';
import { Friendship } from 'src/db/entities/friendship.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
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

  queryFriendIdsByUserId(userId: string): Promise<string[]> {
    return this.friendshipRepository
      .createQueryBuilder('fs')
      .select(['fs.senderId', 'fs.receiverId'])
      .where('fs.senderId = :userId OR fs.receiverId = :userId', { userId })
      .getRawMany()
      .then((res) =>
        res.map((item) =>
          item.senderId === userId ? item.receiverId : item.senderId,
        ),
      );
  }

  async getFriendList(request: Request) {
    const userId = (request.user as User).id;
    const friend_ids = await this.queryFriendIdsByUserId(userId);
    if (!friend_ids?.length) return [];
    return this.userRepository
      .createQueryBuilder('u')
      .where('u.id IN (:...friends)', { friends: friend_ids })
      .orderBy('u.name')
      .getMany();
  }

  async getStrangerList(request: Request) {
    const userId = (request.user as User).id;
    const friend_ids = await this.queryFriendIdsByUserId(userId);
    // add current user
    friend_ids.push(userId);
    return this.userRepository
      .createQueryBuilder('u')
      .where('u.id NOT IN (:...friends)', { friends: friend_ids })
      .getMany();
  }

  async isUserExisted(userId: string): Promise<boolean> {
    const res = await this.userRepository.findOneBy({ id: userId });
    return res !== null;
  }

  findUserById(userId: string): Promise<User> {
    return this.userRepository.findOneBy({ id: userId });
  }
}
