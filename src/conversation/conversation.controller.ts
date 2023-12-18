import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Request, Response } from 'express';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Conversation Module')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'create conversation' })
  createConversation(
    @Req() request: Request,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.conversationService.createConversation(
      request,
      createConversationDto,
    );
  }

  @Get('get-list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get conversation list of current user' })
  getList(@Req() request: Request, @Res() response: Response) {
    return this.conversationService.getList(request, response);
  }

  @Post('set-messages-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'set all messages status of conversation' })
  setAllMessagesReadStatusByConversation(
    @Req() request: Request,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.setAllMessagesReadStatusByConversation(
      request,
      updateConversationDto,
    );
  }
}
