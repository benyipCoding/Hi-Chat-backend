import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CreateFriendDto } from './dto/create-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Friends } from 'src/db/entities/friends.entity';
import { Repository } from 'typeorm';
import { User } from 'src/db/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendRequest } from 'src/event/enum';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friends)
    private readonly friendsRepository: Repository<Friends>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly event: EventEmitter2,
  ) {}

  async friendInvitation(request: Request, createFriendDto: CreateFriendDto) {
    const promiseList: Promise<Friends>[] = [];
    for (const id of createFriendDto.userIds) {
      const receiver = await this.userRepository.findOne({ where: { id } });
      if (!receiver) continue;
      const existedRecord = await this.friendsRepository
        .createQueryBuilder('f')
        .where('f.senderId = :sender AND f.receiverId = :receiver', {
          sender: (request.user as User).id,
          receiver: id,
        })
        .getOne();

      if (existedRecord) {
        existedRecord.greetings += `&nbsp;${createFriendDto.greetings}`;
        this.friendsRepository.save(existedRecord);
        continue;
      }

      const friendRequestData = await this.friendsRepository.create({
        sender: request.user,
        receiver,
        greetings: createFriendDto.greetings,
      });
      promiseList.push(this.friendsRepository.save(friendRequestData));
    }

    const result = await Promise.all(promiseList);
    this.event.emit(FriendRequest.CREATE, result);
    return result.length;
  }
}
