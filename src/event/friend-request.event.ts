import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { Injectable, Logger } from '@nestjs/common';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { OnEvent } from '@nestjs/event-emitter';
import { FriendRequest } from './enum';
import { Friends } from 'src/db/entities/friends.entity';
import { SocketEvent } from 'src/utils/enum';
import { FriendshipStatus } from 'src/db/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FriendRequestEvent {
  constructor(
    private readonly wsGateway: WebsocketGateway,
    private readonly socketManager: SocketManagerStorage,
    @InjectRepository(Friends)
    private readonly friendsRepository: Repository<Friends>,
  ) {}

  private logger = new Logger('friend-request');

  @OnEvent(FriendRequest.CREATE)
  async onFriendRequestCreate(payload: Friends[]) {
    for (const friend of payload) {
      //check if receiver is online?
      const socketId = await this.socketManager.getSocketId(friend.receiver.id);
      if (!socketId) continue;

      const isSent = this.wsGateway.server
        .to(socketId)
        .emit(SocketEvent.FRIEND_REQUEST, {
          ...friend,
          receiver: undefined,
          status: undefined,
        });
      if (!isSent) {
        this.logger.error(
          `Something wrong with sending friend request to ${friend.receiver.name} in realtime`,
        );
        continue;
      }
      friend.status = FriendshipStatus.SENT;
      await this.friendsRepository.save(friend);
    }
  }
}
