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
import { Message } from './message.entity';
import { Gender } from '../types';
import { Nickname } from './nickName.entity';

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

  @ManyToMany(() => Message, (message) => message.seenByUsers)
  seenMessages: Message[];

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: Gender;

  @OneToMany(() => Nickname, (nick) => nick.owner, { onDelete: 'CASCADE' })
  nicknameStore: Nickname[];

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'avatar_key', comment: 'COS avatar key', nullable: true })
  avatarKey: string;
}
