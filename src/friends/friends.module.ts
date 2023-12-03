import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Friends } from 'src/db/entities/friends.entity';
import { RedisService } from 'src/redis/redis.service';
import { Friendship } from 'src/db/entities/friendship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friends, Friendship])],
  controllers: [FriendsController],
  providers: [FriendsService, SocketManagerStorage, RedisService],
  exports: [FriendsService],
})
export class FriendsModule {}
