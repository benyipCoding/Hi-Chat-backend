import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateGroupConversationDto {
  @IsNotEmpty()
  @IsArray()
  members: string[];
}
