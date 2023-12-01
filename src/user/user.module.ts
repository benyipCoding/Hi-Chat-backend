import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../db/entities/user.entity';
import { UserController } from './user.controller';
import { Friendship } from 'src/db/entities/friendship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
