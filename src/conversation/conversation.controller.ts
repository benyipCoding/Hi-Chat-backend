import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('conversation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Conversation Module')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get conversation by id' })
  getConversationById(@Param('id') id: number) {
    return this.conversationService.getConversationById(id);
  }
}
