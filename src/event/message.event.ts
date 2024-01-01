import { User } from 'src/db/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { GroupMessageDeliver, MessageDeliver } from './enum';
import { Message } from 'src/db/entities/message.entity';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { SocketEvent } from 'src/utils/enum';
import { GroupMessage } from 'src/db/entities/group-message.entity';

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
      id: message.id,
      content: message.content,
      sender: message.sender,
      conversation: message.conversation,
    });
  }

  @OnEvent(GroupMessageDeliver.SEND_GROUP_MSG_TO)
  async sendGroupMsgToMembers(data: {
    targetUsers: User[];
    message: GroupMessage;
  }) {
    const { targetUsers, message } = data;
    for (const user of targetUsers) {
      if (user.id === message.sender.id) continue;
      const socketId = await this.socketManager.getSocketId(user.id);
      if (!socketId) continue;

      this.wsGateway.server
        .to(socketId)
        .emit(SocketEvent.GROUP_MESSAGE_DELIVER, message);
    }
  }
}
