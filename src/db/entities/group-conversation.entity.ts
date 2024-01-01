import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { GroupMessage } from './group-message.entity';
import { BaseConversation } from './base-conversation';

@Entity({ name: 'group_conversation' })
export class GroupConversation extends BaseConversation {
  @Column({ nullable: false })
  name: string;

  @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
  lastMessageAt: Date;

  @OneToMany(() => GroupMessage, (gmsg) => gmsg.groupConversation, {
    onDelete: 'CASCADE',
  })
  groupMessage: GroupMessage[];

  @ManyToMany(() => User, (user) => user.groupConversations)
  @JoinTable({ name: 'gc_user' })
  members: User[];

  @OneToOne(() => GroupMessage, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: GroupMessage;
}
