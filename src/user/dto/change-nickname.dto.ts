import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeNicknameDto {
  @IsString()
  @IsNotEmpty()
  targetUserId: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}
