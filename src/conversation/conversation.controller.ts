import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Request } from 'express';

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
}
