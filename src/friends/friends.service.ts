import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CreateFriendDto } from './dto/create-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Friends } from 'src/db/entities/friends.entity';
import { Repository } from 'typeorm';
import { User } from 'src/db/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FriendRequest } from 'src/event/enum';
import { ChangeFriendshipDto } from './dto/change-friendship.dto';
import { FriendshipStatus } from 'src/db/types';
import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friends)
    private readonly friendsRepository: Repository<Friends>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly event: EventEmitter2,
    private readonly socketManager: SocketManagerStorage,
  ) {}

  async friendInvitation(request: Request, createFriendDto: CreateFriendDto) {
    const promiseList: Promise<Friends>[] = [];
    for (const id of createFriendDto.userIds) {
      const receiver = await this.userRepository.findOne({ where: { id } });
      if (!receiver) continue;
      const existedRecord = await this.friendsRepository
        .createQueryBuilder('f')
        .where(
          'f.senderId = :sender AND f.receiverId = :receiver AND f.status != :reject',
          {
            sender: (request.user as User).id,
            receiver: id,
            reject: FriendshipStatus.REJECT,
          },
        )
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

  async invitatonsOfUser(request: Request) {
    const res = await this.friendsRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sender', 'sender')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.senderId = :userId or f.receiverId = :userId', {
        userId: (request.user as User).id,
      })
      .orderBy('f.update_at', 'DESC')
      .getMany();
    if (!res?.length) return [];

    return res.map((item: Friends) => ({
      ...item,
      sender: {
        id: item.sender.id,
        name: item.sender.name,
        avatar: item.sender.avatar,
        gender: item.sender.gender,
        email: item.sender.email,
      },
      receiver: {
        id: item.receiver.id,
        name: item.receiver.name,
        avatar: item.receiver.avatar,
        gender: item.receiver.gender,
        email: item.receiver.email,
      },
    }));
  }

  async changeFriendship(changeFriendshipDto: ChangeFriendshipDto) {
    const targetInvitation = await this.friendsRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sender', 'sender')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.id = :id', { id: changeFriendshipDto.id })
      .getOne();

    targetInvitation.status = changeFriendshipDto.status;
    this.friendsRepository.save(targetInvitation);
    // notise sender to fetch invitation api
    const senderSocketId = await this.socketManager.getSocketId(
      targetInvitation.sender.id,
    );
    if (senderSocketId)
      this.event.emit(FriendRequest.REFRESH_INVITATIONS, senderSocketId);
    // if invitation status is accept, start tansaction to update sender and receiver data
    if (changeFriendshipDto.status === FriendshipStatus.REJECT) return;
    // start transaction
    const res = await this.userRepository.manager.transaction(
      async (entityManager) => {
        const [sender, receiver] = await this.userRepository.find({
          where: [
            { id: targetInvitation.sender.id },
            { id: targetInvitation.receiver.id },
          ],
        });

        if (!sender || !receiver)
          throw new BadRequestException('User data in table users is missing');

        if (!sender.friend_ids) sender.friend_ids = receiver.id;
        else sender.friend_ids += `,${receiver.id}`;

        if (!receiver.friend_ids) receiver.friend_ids = sender.id;
        else receiver.friend_ids += `${process.env.SEPARATOR}${sender.id}`;

        await Promise.all([
          entityManager.save(User, {
            id: sender.id,
            friend_ids: sender.friend_ids,
          }),
          entityManager
            .save(User, {
              id: receiver.id,
              friend_ids: receiver.friend_ids,
            })
            .catch(async () => {
              targetInvitation.status = FriendshipStatus.SENT;
              await this.friendsRepository.save(targetInvitation);
              throw new HttpException(
                'something wrong with saving sender & receiver data',
                500,
              );
            }),
        ]);

        return;
      },
    );

    console.log(res);
  }
}
