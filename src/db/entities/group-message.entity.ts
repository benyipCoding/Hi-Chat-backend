import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GroupConversation } from './group-conversation.entity';

@Entity({ name: 'group_message' })
export class GroupMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GroupConversation, (gc) => gc.groupMessage)
  @JoinColumn({ name: 'group_conversation_id' })
  groupConversation: GroupConversation;
}
