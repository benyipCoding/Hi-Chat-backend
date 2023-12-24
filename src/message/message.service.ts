import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/db/entities/conversation.entity';
import { Repository } from 'typeorm';
import { Message } from 'src/db/entities/message.entity';
import { User } from 'src/db/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessageDeliver } from 'src/event/enum';
import { UpdateMessageDto } from './dto/update-message.dto';
import { UserService } from 'src/user/user.service';
import { Subject } from 'rxjs';
import { FriendsService } from 'src/friends/friends.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly event: EventEmitter2,
    private readonly friendsService: FriendsService,
    private readonly userService: UserService,
  ) {}

  // create message
  async create(request: Request, createMessageDto: CreateMessageDto) {
    const existedConversation = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .leftJoinAndSelect('c.recipient', 'recipient')
      .where('c.id = :convId', { convId: createMessageDto.conversationId })
      .getOne();

    if (!existedConversation)
      throw new BadRequestException('The Conversation is not existed!');

    const targetUser =
      existedConversation.creator.id === (request.user as User).id
        ? existedConversation.recipient
        : existedConversation.creator;

    const currentUser = await this.userService.findUserById(
      (request.user as User).id,
    );

    const isFriend = await this.friendsService.isFriend(
      currentUser,
      targetUser,
    );

    if (!isFriend)
      throw new BadRequestException('You are not friends any more!');

    const message = await this.messageRepository.create({
      content: createMessageDto.content,
      sender: request.user,
      conversation: existedConversation,
      seenByUsers: [request.user],
      senderName: (request.user as User).name,
    });

    const msg = await this.messageRepository.save(message);
    existedConversation.lastMessageAt = msg.createAt;
    existedConversation.lastMessage = msg;
    this.conversationRepository.save(existedConversation);

    this.event.emit(MessageDeliver.SEND_MSG_TO, { targetUser, message: msg });

    return msg;
  }

  async queryMessagesByConversation(
    conversationId: number,
    limit: number = 30,
  ) {
    const conversation = await this.conversationRepository.findOneOrFail({
      where: { id: conversationId },
    });

    const messages = await this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.conversation_id = :convId', { convId: conversation.id })
      .orderBy('m.create_at', 'DESC')
      .limit(limit)
      .getMany();

    return messages;
  }

  async updateMessageReadStatus(
    request: Request,
    updateMessageDto: UpdateMessageDto,
  ) {
    const user = request.user as User;
    const existedMessage = await this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.seenByUsers', 'seenByUsers')
      .where('m.id = :msgId', { msgId: updateMessageDto.messageId })
      .getOne();

    existedMessage.seenByUsers.push(user);
    return this.messageRepository.save(existedMessage);
  }

  async queryUnreadMessagesCountByConversation(
    currentUser: User,
    conversations: Conversation[],
    client: Subject<string>,
  ) {
    const unReadMsgCount = {};
    for (const conv of conversations) {
      let count = 0;
      const messages = await this.queryMessagesLeftJoinSeenByUser(conv.id);

      messages.forEach((msg) => {
        const me = msg.seenByUsers.find((user) => user.id === currentUser.id);
        if (!me) {
          count++;
        }
      });
      if (count === 0) continue;
      unReadMsgCount[conv.id] = count;
    }
    client.next(JSON.stringify({ type: 'count', data: unReadMsgCount }) + ';');
  }

  async queryMessagesLeftJoinSeenByUser(conversationId: number) {
    return this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.seenByUsers', 'seenByUsers')
      .where('m.conversation_id = :convId', { convId: conversationId })
      .orderBy('m.id', 'DESC')
      .getMany();
  }
}
