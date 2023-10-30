import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dtos/signIn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { comparePassword } from 'src/utils/helpers';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(signInDto: SignInDto, res: Response) {
    const { userName, password } = signInDto;
    const existingUser = await this.userRepository.findOne({
      where: {
        name: userName,
      },
    });

    if (
      !existingUser ||
      !(await comparePassword(password, existingUser.password))
    )
      throw new UnauthorizedException('Please check your credentials');

    const payload: JwtPayload = {
      name: userName,
      sub: existingUser.id,
    };

    const expireTime = this.configService.get<number>('ACCESS_TOKEN_TTL');

    const accessToken = await this.jwtService.sign(payload);
    const refreshToken = await this.jwtService.sign(payload, {
      expiresIn: expireTime * 24,
    });

    res.cookie('hi_chat_access_token', accessToken, {
      expires: new Date(Date.now() + expireTime * 1000),
    });

    return { accessToken, refreshToken };
  }
}
