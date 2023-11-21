import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { UserService } from './user.service';
import { Request } from 'express';
import { ImportService } from './import.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('User Module')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly importService: ImportService,
  ) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetch userInfo' })
  getUserProfile(@Req() request: Request) {
    return { ...request.user };
  }

  @Get('friendList')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetch friendList' })
  getFriendList(@Req() request: Request) {
    return this.userService.getFriendList(request);
  }

  @Get('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'import mock data' })
  importData() {
    return this.importService.importData();
  }

  @Get('mockFriends')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'add mock friends data' })
  addFriendsInBenUser(@Req() request: Request) {
    return this.importService.addFriendsInBenUser(request);
  }

  @Get('all-stranger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetch all stranger' })
  getStrangerList(@Req() request: Request) {
    return this.userService.getStrangerList(request);
  }
}
