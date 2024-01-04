import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { GroupMessage } from 'src/db/entities/group-message.entity';
import { User } from 'src/db/entities/user.entity';
import { GroupMessageDeliver } from 'src/event/enum';
import { GroupConversationService } from 'src/group-conversation/group-conversation.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class GroupMessageService {
  private readonly queryUnreadGroupMessageByUserId: string = `SELECT gm.*
  FROM group_message gm
      LEFT JOIN seen_users_group sug ON gm.id = sug.groupMessageId AND sug.usersId = ?
  WHERE
      gm.group_conversation_id in (
          SELECT
              gc_user.groupConversationId
          FROM gc_user
          WHERE
              gc_user.usersId = ?
      )
      AND sug.groupMessageId IS NULL;`;

  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMsgRepository: Repository<GroupMessage>,
    private readonly userService: UserService,
    private readonly groupConversationService: GroupConversationService,
    private readonly event: EventEmitter2,
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
      seenByUsers: [currentUser],
    });

    const message = await this.groupMsgRepository.save(groupMsg);
    currentConversation.lastMessage = message;
    currentConversation.lastMessageAt = message.createAt;
    this.groupConversationService.updateLastMessage(currentConversation);
    this.event.emit(GroupMessageDeliver.SEND_GROUP_MSG_TO, {
      targetUsers: currentConversation.members,
      message,
    });

    return message;
  }

  async getMessagesByGroupConvId(groupConvId: number) {
    const messages = await this.groupMsgRepository
      .createQueryBuilder('gm')
      .leftJoin('gm.groupConversation', 'groupConversation')
      .leftJoinAndSelect('gm.sender', 'sender')
      .where('gm.groupConversation.id = :convId', { convId: groupConvId })
      .orderBy('gm.id', 'DESC')
      .limit(50)
      .getMany();

    return messages;
  }

  async updateGroupMessageReadStatus(request: Request, groupMsgId: number) {
    const currentUser = await this.userService.queryCurrentUser(
      request.user as User,
    );
    const groupMsg = await this.groupMsgRepository
      .createQueryBuilder('gm')
      .leftJoinAndSelect('gm.seenByUsers', 'seenByUsers')
      .where('gm.id = :msgId', { msgId: groupMsgId })
      .getOne();
    groupMsg.seenByUsers.push(currentUser);
    return this.groupMsgRepository.save(groupMsg);
  }

  async getUnreadGroupMessages(request: Request) {
    const currentUser = await this.userService.queryCurrentUser(
      request.user as User,
    );
    const result = await this.groupMsgRepository.manager.transaction(
      (entityManager) => {
        return entityManager.query(this.queryUnreadGroupMessageByUserId, [
          currentUser.id,
          currentUser.id,
        ]);
      },
    );
    return result;
  }
}
