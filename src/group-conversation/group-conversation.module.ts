import { Module } from '@nestjs/common';
import { GroupConversationService } from './group-conversation.service';
import { GroupConversationController } from './group-conversation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupConversation } from 'src/db/entities/group-conversation.entity';
import { UserModule } from 'src/user/user.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupConversation]),
    UserModule,
    FriendsModule,
  ],
  controllers: [GroupConversationController],
  providers: [GroupConversationService],
})
export class GroupConversationModule {}
