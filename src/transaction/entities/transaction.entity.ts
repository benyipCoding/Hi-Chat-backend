import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BankEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  money: number;
}
