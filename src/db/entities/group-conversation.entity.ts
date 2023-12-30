import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { GroupMessage } from './group-message.entity';

@Entity({ name: 'group_conversation' })
export class GroupConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
  lastMessageAt: Date;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => GroupMessage, (gmsg) => gmsg.groupConversation, {
    onDelete: 'CASCADE',
  })
  groupMessage: GroupMessage[];

  @UpdateDateColumn({ name: 'update_at', type: 'datetime' })
  updateAt: Date;

  @ManyToMany(() => User, (user) => user.groupConversations)
  @JoinTable({ name: 'gc_user' })
  members: User[];

  @OneToOne(() => GroupMessage, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: GroupMessage;
}
