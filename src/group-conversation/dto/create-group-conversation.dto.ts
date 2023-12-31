import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupConversationDto {
  @IsNotEmpty()
  @IsArray()
  members: string[];

  @IsNotEmpty()
  @IsString()
  groupName: string;
}
