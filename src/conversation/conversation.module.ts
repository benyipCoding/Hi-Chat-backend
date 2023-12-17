import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/db/entities/conversation.entity';
import { FriendsModule } from 'src/friends/friends.module';
import { UserModule } from 'src/user/user.module';
import { Message } from 'src/db/entities/message.entity';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    FriendsModule,
    UserModule,
    MessageModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
