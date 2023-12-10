import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'hello world!!' })
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  conversationId: number;
}
