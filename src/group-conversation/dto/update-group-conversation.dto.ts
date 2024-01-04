import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGroupConversationDto } from './create-group-conversation.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateGroupConversationDto extends PartialType(
  CreateGroupConversationDto,
) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  groupConvId: number;
}
