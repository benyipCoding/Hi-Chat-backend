import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from 'src/db/entities/message.entity';
import { Conversation } from 'src/db/entities/conversation.entity';
import { UserModule } from 'src/user/user.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    UserModule,
    FriendsModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
