import { User } from 'src/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable({ name: 'conversation_user' })
  members: User[];

  @CreateDateColumn({ name: 'create_at' })
  createAt: number;
}
