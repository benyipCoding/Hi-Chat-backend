import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupConversationDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty()
  members: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  groupName: string;
}
