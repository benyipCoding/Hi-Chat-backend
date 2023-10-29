import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Jack' })
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'canikissyou@gmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @ApiProperty({ example: '1234' })
  password: string;
}
