import { Module } from '@nestjs/common';
import { GroupMessageService } from './group-message.service';
import { GroupMessageController } from './group-message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMessage } from 'src/db/entities/group-message.entity';
import { UserModule } from 'src/user/user.module';
import { GroupConversationModule } from 'src/group-conversation/group-conversation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMessage]),
    UserModule,
    GroupConversationModule,
  ],
  controllers: [GroupMessageController],
  providers: [GroupMessageService],
})
export class GroupMessageModule {}
