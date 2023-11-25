import { User } from 'src/db/entities/user.entity';

export type FriendRequestEmitData = {
  sender: User;
  greetings: string;
  createAt: Date;
};
