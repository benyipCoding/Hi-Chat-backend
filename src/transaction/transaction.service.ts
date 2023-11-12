import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BankEntity } from './entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(BankEntity) private readonly bank: Repository<BankEntity>,
  ) {}

  async transMoney(payload: CreateTransactionDto) {
    const res = await this.bank.manager.transaction(async (entityManager) => {
      // check if user existed
      const [from, to] = await Promise.all([
        this.bank.findOne({
          where: { id: payload.from_id },
        }),
        this.bank.findOne({
          where: { id: payload.to_id },
        }),
      ]);

      if (!from || !to) throw new BadRequestException('user do not exist!');
      if (from.money < payload.money)
        throw new BadRequestException('not enough money!');
      entityManager.save(BankEntity, {
        id: to.id,
        money: to.money + payload.money,
      });
      entityManager.save(BankEntity, {
        id: from.id,
        money: from.money - payload.money,
      });
      return 'success';
    });
    return res;
  }
}
