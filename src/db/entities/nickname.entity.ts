import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Index('idx_owner_targetUser', ['owner', 'targetUser'])
export class Nickname {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.nicknameStore)
  @JoinColumn()
  owner: User;

  @OneToOne(() => User)
  @JoinColumn({ name: 'target_user' })
  targetUser: User;

  @Column()
  nickname: string;

  @CreateDateColumn({ name: 'create_at', type: 'datetime' })
  createAt: Date;

  @UpdateDateColumn({ name: 'update_at', type: 'datetime' })
  updateAt: Date;
}
