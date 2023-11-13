import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  // SubscribeMessage,
  // MessageBody,
} from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
// import { Server } from 'socket.io';
// import { CreateWebsocketDto } from './dto/create-websocket.dt'
// import { UpdateWebsocketDto } from './dto/update-websocket.dt

@WebSocketGateway({ cors: true })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly websocketService: WebsocketService) {}

  @WebSocketServer()
  server;
  handleDisconnect() {
    // throw new Error('Method not implemented.');
  }
  handleConnection() {
    console.log(this.server.meta);

    // throw new Error('Method not implemented.');
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
