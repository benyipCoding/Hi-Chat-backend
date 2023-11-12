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
    console.log();

    return { ...request.user };
  }

  @Get('friendList')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetch friendList' })
  getFriendList() {
    return this.userService.getFriendList();
  }

  @Get('import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'import mock data' })
  importData() {
    return this.importService.importData();
  }
}
