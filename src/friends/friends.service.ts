import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CreateFriendDto } from './dto/create-friend.dto';
import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { InjectRepository } from '@nestjs/typeorm';
import { Friends } from 'src/db/entities/friends.entity';
import { Repository } from 'typeorm';
import { User } from 'src/db/entities/user.entity';
// import { User } from 'src/db/entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    private readonly socketManager: SocketManagerStorage,
    @InjectRepository(Friends)
    private readonly friendsRepository: Repository<Friends>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  friendInvitation(request: Request, createFriendDto: CreateFriendDto) {
    createFriendDto.userIds.forEach(async (id) => {
      const receiver = await this.userRepository.findOne({ where: { id } });
      const record = await this.friendsRepository.create({
        sender: request.user,
        receiver,
      });
      this.friendsRepository.save(record);
    });
  }
}
