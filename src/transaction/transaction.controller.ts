import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import {} from './dto/update-transaction.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('测试事务模块')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/transMoney')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '转账' })
  async create(@Body() payload: CreateTransactionDto) {
    const res = await this.transactionService.transMoney(payload);
    console.log('@@@', res);
    return res;
  }
}
