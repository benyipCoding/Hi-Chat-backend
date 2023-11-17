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
import { Server, Socket } from 'socket.io';
import { SocketEvent } from 'src/utils/enum';
// import { CreateWebsocketDto } from './dto/create-websocket.dt'
// import { UpdateWebsocketDto } from './dto/update-websocket.dt

@WebSocketGateway({ cors: true })
// @UseGuards(JwtAuthGuard)
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly websocketService: WebsocketService) {}

  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(client: Socket) {
    console.log('ws disconnected');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: Socket, ...args: any[]) {
    console.log('success');
    // console.log(client.id);
    this.server
      .to(client.id)
      .emit(SocketEvent.MESSAGE, `Welcome to Hi-Chat ${client.id}`);
  }

  // @WebSocketServer()
  // server: Server;
  // handleDisconnect(client: any) {
  //   console.log('disconnected');
  //   //@ts-ignore
  //   console.log(this.server.meta!);
  // }
  // handleConnection(client: any, ...args: any[]) {
  //   console.log('connected');
  // }

  // @SubscribeMessage('createWebsocket')
  // create(@MessageBody() createWebsocketDto: CreateWebsocketDto) {
  //   return this.websocketService.create(createWebsocketDto);
  // }

  // @SubscribeMessage('findAllWebsocket')
  // findAll() {
  //   return this.websocketService.findAll();
  // }

  // @SubscribeMessage('findOneWebsocket')
  // findOne(@MessageBody() id: number) {
  //   return this.websocketService.findOne(id);
  // }

  // @SubscribeMessage('updateWebsocket')
  // update(@MessageBody() updateWebsocketDto: UpdateWebsocketDto) {
  //   return this.websocketService.update(updateWebsocketDto.id, updateWebsocketDto);
  // }

  // @SubscribeMessage('removeWebsocket')
  // remove(@MessageBody() id: number) {
  //   return this.websocketService.remove(id);
  // }
}
