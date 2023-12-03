import { IsNotEmpty } from 'class-validator';
import { User } from 'src/db/entities/user.entity';

export class CreateConversationDto {
  @IsNotEmpty()
  target: User;
}
