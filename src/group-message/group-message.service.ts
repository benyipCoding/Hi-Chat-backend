import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { GroupMessage } from 'src/db/entities/group-message.entity';
import { User } from 'src/db/entities/user.entity';
import { GroupConversationService } from 'src/group-conversation/group-conversation.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class GroupMessageService {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMsgRepository: Repository<GroupMessage>,
    private readonly userService: UserService,
    private readonly groupConversationService: GroupConversationService,
  ) {}

  async createGroupMessage(
    request: Request,
    createMessageDto: CreateMessageDto,
  ) {
    const currentUser = await this.userService.queryCurrentUser(
      request.user as User,
    );

    const currentConversation =
      await this.groupConversationService.findGroupConversationById(
        createMessageDto.conversationId,
      );

    const groupMsg = await this.groupMsgRepository.create({
      content: createMessageDto.content,
      sender: currentUser,
      senderName: currentUser.displayName,
      groupConversation: currentConversation,
    });

    const message = await this.groupMsgRepository.save(groupMsg);
    currentConversation.lastMessage = message;
    currentConversation.lastMessageAt = message.createAt;
    await this.groupConversationService.updateLastMessage(currentConversation);
  }
}
