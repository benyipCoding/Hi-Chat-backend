import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateFriendDto } from './dto/create-friend.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Friendship module')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'friend invitation' })
  friendInvitation(
    @Req() request: Request,
    @Body() createFriendDto: CreateFriendDto,
  ) {
    return this.friendsService.friendInvitation(request, createFriendDto);
  }
}
