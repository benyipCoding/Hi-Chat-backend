import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { UserService } from 'src/user/user.service';
import { FriendsService } from 'src/friends/friends.service';
import { User } from 'src/db/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupConversation } from 'src/db/entities/group-conversation.entity';
import { Repository } from 'typeorm';
import { UpdateGroupConversationDto } from './dto/update-group-conversation.dto';
import { GroupMessage } from 'src/db/entities/group-message.entity';
// import { GroupMessageService } from 'src/group-message/group-message.service';

@Injectable()
export class GroupConversationService {
  private readonly queryGroupByUserId: string = `
  SELECT *
  FROM group_conversation gc
  WHERE gc.id IN (
          SELECT
              gcu.groupConversationId
          FROM gc_user gcu
          WHERE
              gcu.usersId = ?
      )
  ORDER BY gc.update_at DESC;`;

  private readonly queryMembersByGroupConvId: string = `select u.id,
  u.avatar,
  u.avatar_key,
  u.display_name,
  u.email,
  u.gender,
  u.name
  FROM (
          SELECT gcu.usersId
          FROM gc_user gcu
          WHERE
              gcu.groupConversationId = ?
      ) t
      LEFT JOIN users u ON u.id = t.usersId`;
  private readonly queryGroupMessageById: string = `SELECT * FROM group_message gm WHERE gm.id = ?;`;

  constructor(
    private readonly userService: UserService,
    private readonly friendsService: FriendsService,
    @InjectRepository(GroupConversation)
    private readonly groupConvRepository: Repository<GroupConversation>,
    @InjectRepository(GroupMessage)
    private readonly groupMsgRepository: Repository<GroupMessage>,
  ) {}

  async createGroup(request: Request, gcDto: CreateGroupConversationDto) {
    const currentUser = await this.userService.queryCurrentUser(
      request.user as User,
    );
    const count = await this.countByCreator(currentUser);
    if (count >= 5) {
      throw new HttpException(
        'Sorry, each user can only create 5 groups',
        HttpStatus.FORBIDDEN,
      );
    }

    const members: User[] = [currentUser];

    for (const id of gcDto.members) {
      const member = await this.userService.findUserById(id);
      const isFriend = await this.friendsService.isFriend(currentUser, member);
      if (!isFriend)
        throw new BadRequestException(
          'Some of the group members are not your friends any more',
        );
      members.push(member);
    }

    const gc = await this.groupConvRepository.create({
      creator: currentUser,
      members,
      name: gcDto.groupName,
    });

    return this.groupConvRepository.save(gc);
  }

  countByCreator(creator: User) {
    return this.groupConvRepository
      .createQueryBuilder('gc')
      .leftJoinAndSelect('gc.creator', 'creator')
      .where('gc.creator.id = :creatorId', { creatorId: creator.id })
      .getCount();
  }

  async getGroupConversationList(request: Request) {
    const groupList = await this.groupConvRepository.manager.transaction(
      async (entityManager) => {
        const result = await entityManager.query(this.queryGroupByUserId, [
          (request.user as User).id,
        ]);
        // handler for each group
        for (const res of result) {
          res.members = await entityManager.query(
            this.queryMembersByGroupConvId,
            [res.id],
          );
          const lastMessage = await entityManager.query(
            this.queryGroupMessageById,
            [res.last_message_id],
          );
          res.lastMessage = lastMessage.length ? lastMessage[0] : null;
        }

        return (result as any[]).filter(
          (res) =>
            res.lastMessage || res.creator_id === (request.user as User).id,
        );
      },
    );

    return groupList;
  }

  findGroupConversationById(groupConvId: number): Promise<GroupConversation> {
    return this.groupConvRepository
      .createQueryBuilder('gc')
      .leftJoinAndSelect('gc.members', 'members')
      .where('gc.id = :convId', { convId: groupConvId })
      .getOne();
  }

  updateLastMessage(groupConv: GroupConversation) {
    return this.groupConvRepository.save(groupConv);
  }

  async renameGroup(dto: UpdateGroupConversationDto) {
    const group = await this.groupConvRepository.findOneByOrFail({
      id: dto.groupConvId,
    });

    group.name = dto.groupName;
    return this.groupConvRepository.save(group);
  }

  async deleteGroup(request: Request, dto: UpdateGroupConversationDto) {
    const currentUser = await this.userService.queryCurrentUser(
      request.user as User,
    );

    const group = await this.groupConvRepository
      .createQueryBuilder('gc')
      .leftJoinAndSelect('gc.creator', 'creator')
      .where('gc.id = :id', { id: dto.groupConvId })
      .getOne();

    if (group.creator.id !== currentUser.id) {
      throw new BadRequestException(
        'Only the creator of the group can remove.',
      );
    }
    await this.deleteAllMessagesByGroupConvId(group.id);
    return this.groupConvRepository.delete(group.id);
  }

  async getMessagesByGroupConvId(groupConvId: number) {
    const messages = await this.groupMsgRepository
      .createQueryBuilder('gm')
      .leftJoin('gm.groupConversation', 'groupConversation')
      .where('gm.groupConversation.id = :convId', { convId: groupConvId })
      .getMany();

    return messages;
  }

  deleteAllMessagesByGroupConvId(groupConvId: number) {
    return this.groupMsgRepository.manager.transaction(async () => {
      const messages = await this.getMessagesByGroupConvId(groupConvId);
      const promiseList: Promise<any>[] = [];
      for (const msg of messages) {
        promiseList.push(this.groupMsgRepository.remove(msg));
      }
      await Promise.all(promiseList);
      return;
    });
  }
}
