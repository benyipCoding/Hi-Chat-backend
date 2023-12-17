import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Request, Response } from 'express';
import { User } from 'src/db/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/db/entities/conversation.entity';
import { Repository } from 'typeorm';
// import { Friendship } from 'src/db/entities/friendship.entity';
import { FriendsService } from 'src/friends/friends.service';
import { UserService } from 'src/user/user.service';
import { Subject } from 'rxjs';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly friendsService: FriendsService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  async createConversation(
    request: Request,
    createConversationDto: CreateConversationDto,
  ) {
    const currentUser = await this.userService.findUserById(
      (request.user as User).id,
    );
    const targetUser = createConversationDto.target;

    if (!(await this.userService.isUserExisted(targetUser.id)))
      throw new BadRequestException('User is not existed!');

    if (!(await this.friendsService.isFriend(currentUser, targetUser)))
      throw new BadRequestException('Users are not friends yet!');

    const existedConversation = await this.conversationRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .leftJoinAndSelect('c.recipient', 'recipient')
      .where('c.creator = :currentUserId AND c.recipient = :targetUserId', {
        currentUserId: currentUser.id,
        targetUserId: targetUser.id,
      })
      .orWhere('c.creator = :targetUserId AND c.recipient = :currentUserId', {
        currentUserId: currentUser.id,
        targetUserId: targetUser.id,
      })
      .getOne();

    if (existedConversation) return existedConversation;

    const conv = await this.conversationRepository.create({
      creator: currentUser,
      recipient: targetUser,
    });

    return this.conversationRepository.save(conv);
  }

  async getList(request: Request, response: Response) {
    const client = new Subject<string>();
    client.subscribe((data) => {
      response.write(data);
    });

    const currentUser = request.user as User;
    try {
      const conversations = await this.conversationRepository
        .createQueryBuilder('conv')
        .leftJoinAndSelect('conv.creator', 'creator')
        .leftJoinAndSelect('conv.recipient', 'recipient')
        .leftJoinAndSelect('conv.lastMessage', 'lastMessage')
        .where('conv.creator_id = :userId', { userId: currentUser.id })
        .orWhere('conv.recipient_id = :userId', {
          userId: currentUser.id,
        })
        .orderBy('conv.update_at', 'DESC')
        .limit(30)
        .getMany();
      const filterConv = conversations.filter((c) => c.lastMessage);
      response.flushHeaders();
      client.next(
        JSON.stringify({ type: 'conversations', data: filterConv }) + ';',
      );

      await this.messageService.queryUnreadMessagesCountByConversation(
        currentUser,
        filterConv,
        client,
      );

      response.end();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
