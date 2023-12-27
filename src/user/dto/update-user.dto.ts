// import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Gender } from 'src/db/types';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'tommy', description: 'displayName of user' })
  displayName: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty()
  gender: Gender;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'xxxx@gmail.com' })
  email: string;
}
