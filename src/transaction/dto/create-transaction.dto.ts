import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1 })
  from_id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 2 })
  to_id: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 500 })
  money: number;
}
