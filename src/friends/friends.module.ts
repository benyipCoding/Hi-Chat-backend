import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { SocketManagerStorage } from 'src/websocket/socket-manager.storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Friends } from 'src/db/entities/friends.entity';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friends])],
  controllers: [FriendsController],
  providers: [FriendsService, SocketManagerStorage, RedisService],
})
export class FriendsModule {}
