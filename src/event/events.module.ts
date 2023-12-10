import { Module } from '@nestjs/common';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { FriendRequestEvent } from './friend-request.event';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friends } from 'src/db/entities/friends.entity';
import { MessageEvent } from './message.event';

@Module({
  imports: [WebsocketModule, TypeOrmModule.forFeature([Friends])],
  providers: [FriendRequestEvent, MessageEvent],
})
export class EventsModule {}
