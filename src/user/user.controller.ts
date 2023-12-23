import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Post,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { UserService } from './user.service';
import { Request } from 'express';
import { ChangeNicknameDto } from './dto/change-nickname.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('User Module')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Get('all-stranger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetch all stranger' })
  getStrangerList(@Req() request: Request) {
    return this.userService.getStrangerList(request);
  }

  @Post('changeNickname')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'change friend nickname' })
  changeNickname(
    @Req() request: Request,
    @Body() changeNicknameDto: ChangeNicknameDto,
  ) {
    return this.userService.changeNickname(request, changeNicknameDto);
  }
}
