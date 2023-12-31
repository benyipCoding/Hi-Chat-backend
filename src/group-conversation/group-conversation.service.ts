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

  constructor(
    private readonly userService: UserService,
    private readonly friendsService: FriendsService,
    @InjectRepository(GroupConversation)
    private readonly groupConvRepository: Repository<GroupConversation>,
  ) {}

  async createGroup(request: Request, gcDto: CreateGroupConversationDto) {
    const currentUser = await this.userService.findUserById(
      (request.user as User).id,
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

        for (const res of result) {
          res.members = await entityManager.query(
            this.queryMembersByGroupConvId,
            [res.id],
          );
        }
        return result;
      },
    );

    return groupList;
  }
}
