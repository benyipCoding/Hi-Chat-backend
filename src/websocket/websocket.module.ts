import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketGateway } from './websocket.gateway';
import { RedisService } from 'src/redis/redis.service';
import { SocketManagerStorage } from './socket-manager.storage';

@Module({
  providers: [
    WebsocketGateway,
    WebsocketService,
    RedisService,
    SocketManagerStorage,
  ],
  exports: [WebsocketGateway, SocketManagerStorage, RedisService],
})
export class WebsocketModule {}
