import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FriendshipStatus } from '../types';

// This table is used to record the records of each friend sending request
@Entity()
export class Friends {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  sender: User;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  receiver: User;

  @CreateDateColumn({ type: 'datetime', name: 'create_at' })
  createAt: Date;

  @Column({
    type: 'enum',
    enum: [
      FriendshipStatus.ACCEPT,
      FriendshipStatus.PENDING,
      FriendshipStatus.REJECT,
    ],
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;
}
