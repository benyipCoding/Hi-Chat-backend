import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  // JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Gender } from '../types';
import { Nickname } from './nickname.entity';
import { GroupConversation } from './group-conversation.entity';
import { GroupMessage } from './group-message.entity';

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

  @ManyToMany(() => Message, (message) => message.seenByUsers)
  seenMessages: Message[];

  @ManyToMany(() => GroupMessage, (groupMessage) => groupMessage.seenByUsers)
  seenGroupMessages: GroupMessage[];

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: Gender;

  @OneToMany(() => Nickname, (nick) => nick.owner, { onDelete: 'CASCADE' })
  nicknameStore: Nickname[];

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'avatar_key', comment: 'COS avatar key', nullable: true })
  avatarKey: string;

  @ManyToMany(() => GroupConversation, (gc) => gc.members)
  groupConversations: GroupConversation[];
}
