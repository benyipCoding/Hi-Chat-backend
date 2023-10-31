import {
  Column,
  Entity,
  PrimaryColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { ISession } from 'connect-typeorm';

@Entity({ name: 'sessions' })
export class Session implements ISession {
  @Index()
  @Column('bigint')
  expiredAt: number = Date.now();

  @PrimaryColumn('varchar', { length: 255 })
  id: string;

  @DeleteDateColumn()
  destroyedAt?: Date;

  @Column('text')
  json: string;
}
