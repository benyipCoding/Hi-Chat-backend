import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @UpdateDateColumn({ name: 'update_at', type: 'datetime' })
  updateAt: Date;

  @Column({
    type: 'enum',
    enum: [
      FriendshipStatus.ACCEPT,
      FriendshipStatus.PENDING,
      FriendshipStatus.REJECT,
      FriendshipStatus.SENT,
      FriendshipStatus.SEEN,
    ],
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @Column()
  greetings: string;
}
