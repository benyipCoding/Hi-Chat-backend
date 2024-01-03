import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupMessageService } from './group-message.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';

@Controller('group-message')
@UseGuards(JwtAuthGuard)
@ApiTags('Group messages module')
@ApiBearerAuth()
export class GroupMessageController {
  constructor(private readonly groupMessageService: GroupMessageService) {}

  @Post('create-group-message')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'create a group conversation' })
  createGroupMessage(
    @Req() request: Request,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.groupMessageService.createGroupMessage(
      request,
      createMessageDto,
    );
  }

  @Get('queryMessagesByGroupConvId/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get group messages' })
  getMessagesByGroupConvId(@Param('id') groupConvId: number) {
    return this.groupMessageService.getMessagesByGroupConvId(groupConvId);
  }

  @Post('updateMessageReadStatus/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'change group message readStatus' })
  updateGroupMessageReadStatus(
    @Req() request: Request,
    @Param('id') groupMsgId: number,
  ) {
    return this.groupMessageService.updateGroupMessageReadStatus(
      request,
      groupMsgId,
    );
  }

  @Get('getUnreadGroupMessages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get unread group messages' })
  getUnreadGroupMessages(@Req() request: Request) {
    return this.groupMessageService.getUnreadGroupMessages(request);
  }
}
