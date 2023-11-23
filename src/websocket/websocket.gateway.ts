import { SocketManagerStorage } from './socket-manager.storage';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  // SubscribeMessage,
  // MessageBody,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { Server } from 'socket.io';
import { SocketEvent } from 'src/utils/enum';
import { AuthSocket } from './interface';
// import { CreateWebsocketDto } from './dto/create-websocket.dt'
// import { UpdateWebsocketDto } from './dto/update-websocket.dt

@WebSocketGateway({ cors: true })
// @UseGuards(JwtAuthGuard)
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly socketManager: SocketManagerStorage,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleDisconnect(socket: AuthSocket) {
    await this.socketManager.remove(socket.user.sub);
  }
  async handleConnection(socket: AuthSocket) {
    await this.socketManager.insert(socket.user.sub, socket.id);
    this.server
      .to(socket.id)
      .emit(SocketEvent.MESSAGE, `Welcome to Hi-Chat ${socket.id}`);
  }
}
