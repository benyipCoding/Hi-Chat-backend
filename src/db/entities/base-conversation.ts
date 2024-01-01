import {
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export abstract class BaseConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @UpdateDateColumn({ name: 'update_at', type: 'datetime' })
  updateAt: Date;
}
