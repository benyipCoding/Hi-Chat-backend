import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { Injectable } from '@nestjs/common';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { OnEvent } from '@nestjs/event-emitter';
import { FriendRequest } from './enum';
import { Friends } from 'src/db/entities/friends.entity';

@Injectable()
export class FriendRequestEvent {
  constructor(
    private readonly wsGateway: WebsocketGateway,
    private readonly socketManager: SocketManagerStorage,
  ) {}

  @OnEvent(FriendRequest.CREATE)
  onFriendRequestCreate(payload: Friends[]) {
    console.log('this is onFriendRequestCreate func');
  }
}
