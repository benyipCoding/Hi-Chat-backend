import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
}
