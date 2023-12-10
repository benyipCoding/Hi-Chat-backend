import { User } from 'src/db/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { MessageDeliver } from './enum';
import { Message } from 'src/db/entities/message.entity';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { SocketEvent } from 'src/utils/enum';

@Injectable()
export class MessageEvent {
  constructor(
    private readonly socketManager: SocketManagerStorage,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  @OnEvent(MessageDeliver.SEND_MSG_TO)
  async sendMsgToUser(data: { targetUser: User; message: Message }) {
    const { targetUser, message } = data;
    const socketId = await this.socketManager.getSocketId(targetUser.id);
    if (!socketId) return;
    this.wsGateway.server.to(socketId).emit(SocketEvent.MESSAGE_DELIVER, {
      content: message.content,
      sender: message.sender,
      conversation: message.conversation,
    });
  }
}
