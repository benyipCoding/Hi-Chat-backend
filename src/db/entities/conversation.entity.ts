import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @Column({ name: 'last_message_at', type: 'datetime' })
  lastMessageAt: Date;

  @Column()
  name: string;

  @Column()
  isGroup: boolean;

  @ManyToMany(() => User, (user) => user.conversations)
  @JoinTable({ name: 'conversation_user' })
  users: User[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @Column()
  cover: string;
}
