import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupMessageDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'hello world!!' })
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  groupConvId: number;
}
