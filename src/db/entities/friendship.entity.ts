import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index('idx_sender_receiver', ['sender', 'receiver'])
@Index('idx_receiver_sender', ['receiver', 'sender'])
export class Friendship {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  sender: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  receiver: User;

  @CreateDateColumn({ name: 'create_at' })
  createAt: number;

  @UpdateDateColumn({ name: 'update_at' })
  updateAt: number;
}
