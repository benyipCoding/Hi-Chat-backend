import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { FriendshipStatus } from 'src/db/types';

export class ChangeFriendshipDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: FriendshipStatus.ACCEPT })
  status: FriendshipStatus.ACCEPT | FriendshipStatus.REJECT;
}
