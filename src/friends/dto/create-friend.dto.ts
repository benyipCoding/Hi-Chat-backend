import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty()
  userIds: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  helloText: string;
}
