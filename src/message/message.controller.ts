import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('message')
@UseGuards(JwtAuthGuard)
@ApiTags('Message module')
@ApiBearerAuth()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'create a message data' })
  createMessage(
    @Req() request: Request,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.create(request, createMessageDto);
  }

  @Get('queryMessagesByConversation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'create a message data' })
  queryMessagesByConversation(@Query('conversationId') conversationId: number) {
    return this.messageService.queryMessagesByConversation(conversationId);
  }

  @Post('updateMessageReadStatus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'change message read status' })
  updateMessageReadStatus(
    @Req() request: Request,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.updateMessageReadStatus(
      request,
      updateMessageDto,
    );
  }
}
