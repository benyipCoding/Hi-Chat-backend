import {
  // Column,
  Entity,
  // PrimaryGeneratedColumn,
  // CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';
import { BaseMessage } from './base-message';

@Entity({ name: 'messages' })
export class Message extends BaseMessage {
  // @PrimaryGeneratedColumn()
  // id: number;

  // @Column()
  // content: string;

  // @Column({ nullable: true })
  // image: string;

  // @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  // createAt: Date;

  // @ManyToOne(() => User, { createForeignKeyConstraints: false })
  // @JoinColumn({ name: 'sender_id' })
  // sender: User;

  @ManyToMany(() => User, (user) => user.seenMessages)
  @JoinTable({ name: 'seen_users' })
  seenByUsers: User[];

  @ManyToOne(() => Conversation, (con) => con.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // @Column({ name: 'sender_name', nullable: false })
  // senderName: string;
}
