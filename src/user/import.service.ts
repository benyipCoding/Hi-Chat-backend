import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
  ) {}

  async importData() {
    const rawData = fs.readFileSync(
      join(__dirname, './mock_users.csv'),
      'utf-8',
    );
    const arr = rawData.split('\r\n');
    arr.pop();
    arr.shift();
    try {
      return this.userRepository.manager.transaction(async (manager) => {
        for (const item of arr) {
          const data = item.split(',');
          const payload: CreateUserDto = {
            userName: data[0],
            email: data[1],
            password: data[2],
          };
          await this.userService.createUser(payload);
        }
        return 'success';
      });
    } catch (error) {
      throw new HttpException(
        'Import failure',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
