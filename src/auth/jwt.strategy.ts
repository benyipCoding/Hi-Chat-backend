import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload, Tokens } from './interfaces';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly authService: AuthService,
  ) {
    const options: StrategyOptions = {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
    };
    super(options);
  }

  async validate(payload: JwtPayload): Promise<User & Tokens> {
    // console.log(2);
    const res = await this.refreshTokenIdsStorage.validate(
      payload.sub,
      payload.tokenId,
    );

    if (!res)
      throw new UnauthorizedException(
        'Invalid token! Please check your credentials',
      );

    const now = Date.now() / 1000;
    let tokens = undefined;
    if (now > payload.exp) {
      tokens = await this.authService.generateTokens({
        name: payload.name,
        sub: payload.sub,
        tokenId: payload.tokenId,
      });
    }
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    return { ...user, ...tokens };
  }
}
