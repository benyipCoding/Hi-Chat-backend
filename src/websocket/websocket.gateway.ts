import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  // MessageBody,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { Server } from 'socket.io';
import { AuthSocket } from './interface';
import { SocketEvent } from 'src/utils/enum';

@WebSocketGateway(3002, {
  cors: {
    origin: [
      'http://10.7.46.174:3001',
      'http://139.199.77.238',
      'http://192.168.0.101:3001',
    ],
    credentials: true,
  },
})
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

  @SubscribeMessage(SocketEvent.REFRESH_UNTREATEDCOUNT)
  refreshUntreatedCount(@ConnectedSocket() socket: AuthSocket) {
    this.websocketService.QueryUntreatedInvitations(this.server, socket);
  }
}
