import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Body,
  Get,
  Param,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateFriendDto } from './dto/create-friend.dto';
import { ChangeFriendshipDto } from './dto/change-friendship.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Friendship module')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'send friend invitations' })
  friendInvitation(
    @Req() request: Request,
    @Body() createFriendDto: CreateFriendDto,
  ) {
    return this.friendsService.friendInvitation(request, createFriendDto);
  }

  @Get('users-invitations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get all invitations by userId' })
  invitatonsOfUser(@Req() request: Request) {
    return this.friendsService.invitatonsOfUser(request);
  }

  @Post('changeFriendship')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'change friendship status' })
  changeFriendship(@Body() changeFriendshipDto: ChangeFriendshipDto) {
    return this.friendsService.changeFriendship(changeFriendshipDto);
  }

  @Post('delete-friendship/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'delete friendship with user id' })
  deleteFriendship(@Req() request: Request, @Param('id') targetUserId: string) {
    return this.friendsService.deleteFriendship(request, targetUserId);
  }
}
