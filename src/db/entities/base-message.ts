import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export abstract class BaseMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_name', nullable: false })
  senderName: string;
}
