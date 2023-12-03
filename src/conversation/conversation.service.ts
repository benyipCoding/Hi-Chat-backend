import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Request } from 'express';
import { User } from 'src/db/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/db/entities/conversation.entity';
import { Repository } from 'typeorm';
// import { Friendship } from 'src/db/entities/friendship.entity';
import { FriendsService } from 'src/friends/friends.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly friendsService: FriendsService,
    private readonly userService: UserService,
  ) {}

  async createConversation(
    request: Request,
    createConversationDto: CreateConversationDto,
  ) {
    const currentUser = request.user as User;
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
}
