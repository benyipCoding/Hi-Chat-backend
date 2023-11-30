import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Gender } from '../types';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @UpdateDateColumn({ name: 'update_at', type: 'datetime' })
  updateAt: Date;

  @OneToMany(() => Message, (message) => message.sender)
  @JoinColumn()
  messages: Message[];

  @ManyToMany(() => Conversation, (con) => con.users)
  conversations: Conversation[];

  @ManyToMany(() => Message, (message) => message.seenByUsers)
  seenMessages: Message[];

  // @Column({ nullable: true })
  // refresh_token: string;

  @Column({ type: 'longtext', nullable: true })
  friend_ids: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: Gender;
}
