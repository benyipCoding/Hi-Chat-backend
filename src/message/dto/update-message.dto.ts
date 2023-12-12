// import { PartialType } from '@nestjs/swagger';
// import { CreateMessageDto } from './create-message.dto';

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMessageDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  messageId: number;
}
