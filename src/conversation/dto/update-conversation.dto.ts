// import { PartialType } from '@nestjs/swagger';
// import { CreateConversationDto } from './create-conversation.dto';

import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateConversationDto {
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;
}
