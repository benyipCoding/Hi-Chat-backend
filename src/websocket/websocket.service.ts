import { Injectable } from '@nestjs/common';
import { SocketManagerStorage } from './socket-manager.storage';
import { Server } from 'socket.io';
import { SocketEvent } from 'src/utils/enum';
import { AuthSocket } from './interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Friends } from 'src/db/entities/friends.entity';
import { Repository } from 'typeorm';
import { FriendshipStatus } from 'src/db/types';

@Injectable()
export class WebsocketService {
  constructor(
    private readonly socketManager: SocketManagerStorage,
    @InjectRepository(Friends)
    private readonly friendRepository: Repository<Friends>,
  ) {}

  async addSocketToRedis(server: Server, socket: AuthSocket) {
    // Redis
    await this.socketManager.insert(socket.user.sub, socket.id);
    server
      .to(socket.id)
      .emit(SocketEvent.MESSAGE, `Welcome to Hi-Chat ${socket.id}`);
  }

  removeSocketFromRedis(socket: AuthSocket) {
    this.socketManager.remove(socket.user.sub);
  }

  async QueryUntreatedInvitations(server: Server, socket: AuthSocket) {
    const invitations = await this.friendRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.sender', 'sender')
      .leftJoinAndSelect('f.receiver', 'receiver')
      .where('f.receiverId = :userId', {
        userId: socket.user.sub,
      })
      .andWhere('f.status IN (:...statuses)', {
        statuses: [FriendshipStatus.PENDING, FriendshipStatus.SENT],
      })
      .getMany();

    for (const i of invitations) {
      if (i.status !== FriendshipStatus.PENDING) continue;
      i.status = FriendshipStatus.SENT;
      await this.friendRepository.save(i);
      const senderSocket = await this.socketManager.getSocketId(i.sender.id);
      if (senderSocket)
        server.to(senderSocket).emit(SocketEvent.FRIEND_REQUEST);
    }

    server.to(socket.id).emit(
      SocketEvent.UNTREATED_INVITATIONS,
      invitations.map((i) => ({
        ...i,
        sender: i.sender.id,
        receiver: i.receiver.id,
      })),
    );
  }
}
