import { Module } from '@nestjs/common';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { FriendRequestEvent } from './friend-request.event';

@Module({
  imports: [WebsocketModule],
  providers: [FriendRequestEvent],
})
export class EventsModule {}
