import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupConversationService } from './group-conversation.service';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { Request } from 'express';

@Controller('group-conversation')
@UseGuards(JwtAuthGuard)
@ApiTags('Group conversation module')
@ApiBearerAuth()
export class GroupConversationController {
  constructor(
    private readonly groupConversationService: GroupConversationService,
  ) {}

  @Post('create-group')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'create a group conversation' })
  createGroup(
    @Req() request: Request,
    @Body() gcDto: CreateGroupConversationDto,
  ) {
    return this.groupConversationService.createGroup(request, gcDto);
  }

  @Get('get-conv-list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'get group conversation list' })
  getGroupConversationList(@Req() request: Request) {
    return this.groupConversationService.getGroupConversationList(request);
  }
}
