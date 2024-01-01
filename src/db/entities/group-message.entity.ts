import { Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { GroupConversation } from './group-conversation.entity';
import { BaseMessage } from './base-message';
import { User } from './user.entity';

@Entity({ name: 'group_message' })
export class GroupMessage extends BaseMessage {
  @ManyToOne(() => GroupConversation, (gc) => gc.groupMessage)
  @JoinColumn({ name: 'group_conversation_id' })
  groupConversation: GroupConversation;

  @ManyToMany(() => User, (user) => user.seenGroupMessages)
  @JoinTable({ name: 'seen_users_group' })
  seenByUsers: User[];
}
