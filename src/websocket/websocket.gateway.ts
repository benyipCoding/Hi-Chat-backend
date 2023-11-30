import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  // SubscribeMessage,
  // MessageBody,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { Server } from 'socket.io';
import { AuthSocket } from './interface';

@WebSocketGateway({ cors: true })
// @UseGuards(JwtAuthGuard)
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly websocketService: WebsocketService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: AuthSocket) {
    this.websocketService.addSocketToRedis(this.server, socket);
    this.websocketService.QueryUntreatedInvitations(this.server, socket);
  }

  handleDisconnect(socket: AuthSocket) {
    this.websocketService.removeSocketFromRedis(socket);
  }
}
