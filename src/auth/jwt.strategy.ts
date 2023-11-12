import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, StrategyOptions, ExtractJwt } from 'passport-jwt';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from './interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    const options: StrategyOptions = {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
    };
    super(options);
  }

  async validate(payload: JwtPayload): Promise<User> {
    const now = Date.now() / 1000;
    if (now > payload.exp)
      throw new UnauthorizedException('Bearer token has been expired!');

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    return user;
  }
}
