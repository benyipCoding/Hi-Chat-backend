import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/helpers';
import { Request } from 'express';
import { Friendship } from 'src/db/entities/friendship.entity';
import { ChangeNicknameDto } from './dto/change-nickname.dto';
import { Nickname } from 'src/db/entities/nickName.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(Nickname)
    private readonly nicknameRepository: Repository<Nickname>,
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
      displayName: createUserDto.userName,
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
    const friendList = await this.userRepository
      .createQueryBuilder('u')
      .where('u.id IN (:...friends)', { friends: friend_ids })
      .orderBy('u.name')
      .getMany();

    const friendListWithNickname = [];

    for (const friend of friendList) {
      const nickname = await this.findNicknameById(userId, friend.id);
      friendListWithNickname.push({
        ...friend,
        nickname: nickname?.nickname || null,
      });
    }

    return friendListWithNickname;
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

  async changeNickname(request: Request, changeNicknameDto: ChangeNicknameDto) {
    // check targetUser is existed or not
    const currentUser = await this.findUserById((request.user as User).id);

    const targetUser = await this.userRepository.findOneByOrFail({
      id: changeNicknameDto.targetUserId,
    });

    const existedNickname = await this.findNicknameById(
      currentUser.id,
      targetUser.id,
    );

    if (existedNickname) {
      existedNickname.nickname = changeNicknameDto.nickname;
      return this.nicknameRepository.save(existedNickname);
    }

    const nickname = await this.nicknameRepository.create({
      owner: currentUser,
      nickname: changeNicknameDto.nickname,
      targetUser,
    });
    return this.nicknameRepository.save(nickname);
  }

  findNicknameById(currentUserId: string, targetUserId: string) {
    return this.nicknameRepository
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.owner', 'owner')
      .leftJoinAndSelect('n.targetUser', 'targetUser')
      .where('n.ownerId = :currentId AND n.target_user = :targetId', {
        currentId: currentUserId,
        targetId: targetUserId,
      })
      .getOne();
  }

  async updateUserInfo(request: Request, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findUserById((request.user as User).id);
      user.displayName = updateUserDto.displayName;
      user.gender = updateUserDto.gender;
      user.email = updateUserDto.email;
      return this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Please check your input');
    }
  }

  async updateAvatarByUserId(
    userId: string,
    avatar: string,
    avatarKey: string,
  ) {
    const user = await this.findUserById(userId);
    if (!user)
      throw new HttpException('User does not existed!', HttpStatus.BAD_REQUEST);
    user.avatar = avatar;
    user.avatarKey = avatarKey;

    return this.userRepository.save(user);
  }
}
