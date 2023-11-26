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
      // handler for sender
      const senderSocketId = await this.socketManager.getSocketId(
        friend.sender.id,
      );
      this.wsGateway.server
        .to(senderSocketId)
        .emit(SocketEvent.ADD_FRIEND_REQUEST_RECORD, friend);

      //handler for receiver
      const receiverSocketId = await this.socketManager.getSocketId(
        friend.receiver.id,
      );
      if (!receiverSocketId) continue;

      const isSent = this.wsGateway.server
        .to(receiverSocketId)
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
