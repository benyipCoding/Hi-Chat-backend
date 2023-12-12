import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dtos/signIn.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { comparePassword } from 'src/utils/helpers';
import { JwtPayload, RefreshTokenPayload, Tokens } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signIn(signInDto: SignInDto) {
    const { userName, password } = signInDto;
    const existingUser = await this.userRepository.findOne({
      where: {
        name: userName,
      },
      select: {
        password: true,
        id: true,
      },
    });

    if (
      !existingUser ||
      !(await comparePassword(password, existingUser.password)) ||
      !existingUser.id
    )
      throw new UnauthorizedException(
        'User is not existed or credential valid failure',
      );

    const payload: JwtPayload = {
      sub: existingUser.id,
      name: userName,
    };

    const tokens = await this.generateTokens(payload);
    return tokens;
  }

  async generateTokens(payload: JwtPayload): Promise<Tokens> {
    if (!payload.tokenId) {
      payload.tokenId = randomUUID();
    }
    const expireTime = +this.configService.get<number>('REFRESH_TOKEN_TTL');

    const accessToken = this.jwtService.sign({
      ...payload,
    } as JwtPayload);
    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, tokenId: payload.tokenId } as RefreshTokenPayload,
      {
        expiresIn: expireTime,
      },
    );

    this.refreshTokenIdsStorage.insert(payload.sub, payload.tokenId);

    return { accessToken, refreshToken };
  }

  logout(request: Request) {
    return this.refreshTokenIdsStorage.removeTokenId((request.user as User).id);
  }
}
