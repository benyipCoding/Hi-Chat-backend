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

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly event: EventEmitter2,
  ) {}

  // create conversation
  async create(request: Request, createMessageDto: CreateMessageDto) {
    const existedConversation = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .leftJoinAndSelect('c.recipient', 'recipient')
      .where('c.id = :convId', { convId: createMessageDto.conversationId })
      .getOne();

    if (!existedConversation)
      throw new BadRequestException('The Conversation is not existed!');

    const message = await this.messageRepository.create({
      content: createMessageDto.content,
      sender: request.user,
      conversation: existedConversation,
      seenByUsers: [request.user],
    });

    const targetUser =
      existedConversation.creator.id === (request.user as User).id
        ? existedConversation.recipient
        : existedConversation.creator;

    const msg = await this.messageRepository.save(message);
    existedConversation.lastMessageAt = msg.createAt;
    existedConversation.lastMessage = msg;
    this.conversationRepository.save(existedConversation);

    this.event.emit(MessageDeliver.SEND_MSG_TO, { targetUser, message: msg });

    return msg;
  }

  async queryMessagesByConversation(conversationId: number) {
    const conversation = await this.conversationRepository.findOneOrFail({
      where: { id: conversationId },
    });

    const messages = await this.messageRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .where('m.conversation_id = :convId', { convId: conversation.id })
      .orderBy('m.create_at', 'DESC')
      .limit(30)
      .getMany();

    return messages;
  }
}
