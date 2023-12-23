import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity({ name: 'conversations' })
@Index('idx_creator_recipient', ['creator', 'recipient'])
@Index('idx_recipient_creator', ['recipient', 'creator'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @Column({ name: 'last_message_at', type: 'datetime', nullable: true })
  lastMessageAt: Date;

  @OneToOne(() => Message, {
    createForeignKeyConstraints: false,
    nullable: true,
    cascade: ['remove'],
  })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage: Message;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @OneToMany(() => Message, (message) => message.conversation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  messages: Message[];

  @UpdateDateColumn({ name: 'update_at', type: 'datetime' })
  updateAt: Date;
}
