import { Exclude } from 'class-transformer';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @ManyToMany(() => Conversation, (c) => c.members)
  conversations: Conversation;
}
