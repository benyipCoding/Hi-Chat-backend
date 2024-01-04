import { Module } from '@nestjs/common';
import { GroupConversationService } from './group-conversation.service';
import { GroupConversationController } from './group-conversation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupConversation } from 'src/db/entities/group-conversation.entity';
import { UserModule } from 'src/user/user.module';
import { FriendsModule } from 'src/friends/friends.module';
import { GroupMessage } from 'src/db/entities/group-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupConversation, GroupMessage]),
    UserModule,
    FriendsModule,
  ],
  controllers: [GroupConversationController],
  providers: [GroupConversationService],
  exports: [GroupConversationService],
})
export class GroupConversationModule {}
