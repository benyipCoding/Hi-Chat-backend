import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'ben' })
  userName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '1234' })
  password: string;
}
