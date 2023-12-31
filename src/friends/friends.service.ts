import { BadRequestException, Injectable } from '@nestjs/common';
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
import { Friendship } from 'src/db/entities/friendship.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friends)
    private readonly friendsRepository: Repository<Friends>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly event: EventEmitter2,
    private readonly socketManager: SocketManagerStorage,
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,
    private readonly userService: UserService,
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

    for (const invitation of res) {
      const targetUser =
        invitation.sender.id !== (request.user as User).id
          ? invitation.sender
          : invitation.receiver;
      const nickname = await this.userService.findNicknameById(
        (request.user as User).id,
        targetUser.id,
      );
      (targetUser as any).nickname =
        nickname?.nickname || targetUser.displayName;
    }

    return res;
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
    // notise sender to refresh invitations
    const senderSocketId = await this.socketManager.getSocketId(
      targetInvitation.sender.id,
    );
    if (senderSocketId)
      this.event.emit(FriendRequest.REFRESH_INVITATIONS, senderSocketId);
    if (changeFriendshipDto.status === FriendshipStatus.REJECT) return;
    // if invitation status is accept
    const friendshipData = await this.friendshipRepository.create({
      sender: targetInvitation.sender,
      receiver: targetInvitation.receiver,
    });

    return this.friendshipRepository.save(friendshipData);
  }

  async isFriend(currentUser: User, targetUser: User): Promise<boolean> {
    const res = await this.friendshipRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sender', 'sender')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.sender.id = :currentId AND f.receiver.id = :targetId', {
        currentId: currentUser.id,
        targetId: targetUser.id,
      })
      .orWhere('f.sender.id = :targetId AND f.receiver.id = :currentId', {
        currentId: currentUser.id,
        targetId: targetUser.id,
      })
      .getOne();

    return res !== null;
  }

  async deleteFriendship(request: Request, targetUserId: string) {
    const friendship = await this.friendshipRepository

      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sender', 'sender')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.sender.id = :currentId AND f.receiver.id = :targetId', {
        currentId: (request.user as User).id,
        targetId: targetUserId,
      })
      .orWhere('f.sender.id = :targetId AND f.receiver.id = :currentId', {
        currentId: (request.user as User).id,
        targetId: targetUserId,
      })
      .getOne();

    if (!friendship)
      throw new BadRequestException('Can not find the relationship!');
    const invitation = await this.friendsRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sender', 'sender')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.sender.id = :currentId AND f.receiver.id = :targetId', {
        currentId: (request.user as User).id,
        targetId: targetUserId,
      })
      .orWhere('f.sender.id = :targetId AND f.receiver.id = :currentId', {
        currentId: (request.user as User).id,
        targetId: targetUserId,
      })
      .getOne();

    this.friendshipRepository.remove(friendship);
    this.friendsRepository.remove(invitation);

    this.event.emit(FriendRequest.REFRESH_FRIENDS, targetUserId);
    return 'success';
  }
}
