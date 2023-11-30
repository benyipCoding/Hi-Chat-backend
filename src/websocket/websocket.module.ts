import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { WebsocketGateway } from './websocket.gateway';
import { RedisService } from 'src/redis/redis.service';
import { SocketManagerStorage } from './socket-manager.storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friends } from 'src/db/entities/friends.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friends])],
  providers: [
    WebsocketGateway,
    WebsocketService,
    RedisService,
    SocketManagerStorage,
  ],
  exports: [
    WebsocketGateway,
    SocketManagerStorage,
    RedisService,
    WebsocketService,
  ],
})
export class WebsocketModule {}
